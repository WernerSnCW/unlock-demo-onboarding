import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { User, Settings, DollarSign, MapPin, Plus, Trash2, Save, Users, Briefcase, PieChart, Building2, Eye } from 'lucide-react';
import { z } from 'zod';
import Header from '../components/Header';
import { useInvestor } from '../contexts/InvestorContext';
import Footer from '../components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { usePortfolioStoreDB } from '@/state/portfolioStoreDB';
import { queryClient, apiRequest } from '@/lib/queryClient';
import type { 
  InsertInvestor, InsertInvestorPreferences, InsertTaxProfile,
  InsertPortfolioAccount, InsertPortfolioHolding,
  PortfolioAccount, PortfolioHolding,
  AlternativeInvestment, InsertAlternativeInvestment,
  InsertProperty, Property
} from '@shared/schema';

// Form schemas
const investorSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  name: z.string().min(1, "Name is required"),
  investorType: z.string().optional(),
});

const preferencesSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  riskBand: z.string().optional(),
  ticketMinGbp: z.string().optional(),
  ticketMaxGbp: z.string().optional(),
  regions: z.array(z.string()).optional(),
  focusSectors: z.array(z.number()).optional(),
  existingInvestments: z.array(z.string()).optional(),
  investmentInterests: z.array(z.string()).optional(),
});

const taxProfileSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  country: z.string().optional(),
  interests: z.array(z.string()).optional(),
  annualEarningsGbp: z.string().optional(),
  cgtAllowanceGbp: z.string().optional(),
});

const portfolioAccountSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  provider: z.string().optional(),
  providerAccountId: z.string().optional(),
  accountType: z.string().optional(),
  currency: z.string().optional(),
  connected: z.boolean().optional(),
  currentBalanceGbp: z.string().optional(),
  cashBalanceGbp: z.string().optional(),
});

const portfolioHoldingSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  accountId: z.string().min(1, 'Please select an account for this holding'),
  assetType: z.string().optional(),
  provider: z.string().optional(),
  sourceRef: z.string().optional(),
  symbol: z.string().optional(),
  name: z.string().optional(),
  sectorId: z.number().optional(),
  quantity: z.string().optional(),
  costBasisGbp: z.string().optional(),
  currentPriceGbp: z.string().optional(),
  currentValueGbp: z.string().optional(),
});

const propertySchema = z.object({
  uprn: z.string().optional(),
  titleNumber: z.string().optional(),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().default('UK'),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  propertyType: z.string().optional(),
  bedrooms: z.string().optional(),
  floorAreaSqm: z.string().optional(),
  yearBuilt: z.string().optional(),
  epcRating: z.string().optional(),
  // Ownership fields
  userId: z.string().min(1, 'User ID is required'),
  ownershipType: z.string().default('direct'),
  sharePct: z.number().min(0).max(100).default(100),
  acquisitionDate: z.string().optional(),
  acquisitionPriceGbp: z.string().optional(),
  acquisitionCostsGbp: z.string().optional(),
  isPrimaryResidence: z.boolean().default(false),
});

const alternativeInvestmentSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  investmentType: z.string().min(1, 'Investment type is required'),
  name: z.string().min(1, 'Investment name is required'),
  description: z.string().optional(),
  investmentDateUk: z.string().optional(),
  maturityDateUk: z.string().optional(),
  investmentAmountGbp: z.string().optional(),
  currentValueGbp: z.string().optional(),
  targetReturnPct: z.string().optional(),
  actualReturnPct: z.string().optional(),
  riskRating: z.string().optional(),
  liquidityPeriod: z.string().optional(),
  minimumInvestment: z.string().optional(),
  fees: z.string().optional(),
  taxWrapperEligible: z.boolean().default(false),
  taxWrapperType: z.string().optional(),
  documentsUrl: z.string().optional(),
  notes: z.string().optional(),
});

type InvestorFormData = z.infer<typeof investorSchema>;
type PreferencesFormData = z.infer<typeof preferencesSchema>;
type TaxProfileFormData = z.infer<typeof taxProfileSchema>;
type PortfolioAccountFormData = z.infer<typeof portfolioAccountSchema>;
type PortfolioHoldingFormData = z.infer<typeof portfolioHoldingSchema>;
type AlternativeInvestmentFormData = z.infer<typeof alternativeInvestmentSchema>;
type PropertyFormData = z.infer<typeof propertySchema>;

interface DemoInvestor {
  userId: string;
  name: string;
  investorType: string;
  riskBand?: string;
  country?: string;
  portfolioAccounts?: PortfolioAccount[];
  portfolioHoldings?: PortfolioHolding[];
}

// Component to display property ownership information
function PropertyOwnershipView({ propertyId }: { propertyId: string }) {
  const { data: ownershipData, isLoading } = useQuery({
    queryKey: ['/api/properties', propertyId, 'ownerships'],
    queryFn: () => fetch(`/api/properties/${propertyId}/ownerships`).then(res => res.json()),
  });

  if (isLoading) {
    return (
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Ownership & Investment</h4>
        <div className="space-y-2 text-sm">
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 rounded"></div>
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 rounded w-3/4"></div>
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const ownership = ownershipData?.[0]; // Assume first ownership record

  return (
    <div>
      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Ownership & Investment</h4>
      <div className="space-y-2 text-sm">
        {ownership ? (
          <>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Ownership Type:</span>
              <p className="text-gray-900 dark:text-gray-100 capitalize">{ownership.ownershipType}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Share:</span>
              <p className="text-gray-900 dark:text-gray-100">{ownership.sharePct}%</p>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Acquisition Date:</span>
              <p className="text-gray-900 dark:text-gray-100">
                {ownership.acquisitionDate ? new Date(ownership.acquisitionDate).toLocaleDateString('en-GB') : 'Not specified'}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Purchase Price:</span>
              <p className="text-gray-900 dark:text-gray-100">
                {ownership.acquisitionPriceGbp ? `£${Number(ownership.acquisitionPriceGbp).toLocaleString()}` : 'Not specified'}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Purchase Costs:</span>
              <p className="text-gray-900 dark:text-gray-100">
                {ownership.acquisitionCostsGbp ? `£${Number(ownership.acquisitionCostsGbp).toLocaleString()}` : 'Not specified'}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Primary Residence:</span>
              <p className="text-gray-900 dark:text-gray-100">
                {ownership.isPrimaryResidence ? 'Yes' : 'No'}
              </p>
            </div>
          </>
        ) : (
          <div>
            <p className="text-gray-600 dark:text-gray-400">No ownership information available</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AccountSettings() {
  const { toast } = useToast();
  const { setCurrentInvestor, positions: portfolioPositions, isLoading: portfolioLoading, addPosition, removePosition } = usePortfolioStoreDB();
  const { selectedInvestor, setSelectedInvestor } = useInvestor();
  const [activeTab, setActiveTab] = useState('preferences');
  
  // Get selected investor ID from context
  const selectedInvestorId = selectedInvestor?.userId || null;
  const [newInvestorName, setNewInvestorName] = useState('');

  // Load investors from database
  const { data: investorsData } = useQuery({
    queryKey: ['/api/investors'],
    queryFn: () => fetch('/api/investors').then(res => res.json()),
  });

  // Load preferences for selected investor
  const { data: preferencesData } = useQuery({
    queryKey: ['/api/investors', selectedInvestorId, 'preferences'],
    queryFn: () => {
      if (!selectedInvestorId) return null;
      return fetch(`/api/investors/${selectedInvestorId}/preferences`).then(res => {
        if (res.ok) return res.json();
        return null; // Return null if preferences don't exist yet
      });
    },
    enabled: !!selectedInvestorId,
  });

  // Load tax profile for selected investor
  const { data: taxProfileData } = useQuery({
    queryKey: ['/api/investors', selectedInvestorId, 'tax-profile'],
    queryFn: () => {
      if (!selectedInvestorId) return null;
      return fetch(`/api/investors/${selectedInvestorId}/tax-profile`).then(res => {
        if (res.ok) return res.json();
        return null; // Return null if tax profile doesn't exist yet
      });
    },
    enabled: !!selectedInvestorId,
  });

  // Local state for demo investors
  const [demoInvestors, setDemoInvestors] = useState<DemoInvestor[]>([]);

  // Update local state when data loads from API
  useEffect(() => {
    if (investorsData?.length > 0) {
      const formattedInvestors = investorsData.map((inv: any) => ({
        userId: inv.userId,
        name: inv.name,
        investorType: inv.investorType,
        riskBand: undefined,
        country: undefined
      }));
      setDemoInvestors(formattedInvestors);
      
      // Auto-select demo investor if none selected and demo investor exists
      if (!selectedInvestor && formattedInvestors.length > 0) {
        const demoInvestor = formattedInvestors.find(inv => inv.userId.includes('demo-1755866735025')) || formattedInvestors[0];
        handleInvestorSelect(demoInvestor.userId);
      }
    }
  }, [investorsData, selectedInvestor]);

  // Form instances
  const investorForm = useForm<InvestorFormData>({
    resolver: zodResolver(investorSchema),
    defaultValues: {
      userId: selectedInvestorId || '',
      name: '',
      investorType: '',
    },
  });

  const preferencesForm = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      userId: selectedInvestorId || '',
      riskBand: '',
      ticketMinGbp: '',
      ticketMaxGbp: '',
      regions: [],
      focusSectors: [],
      existingInvestments: [],
      investmentInterests: [],
    },
  });

  const taxProfileForm = useForm<TaxProfileFormData>({
    resolver: zodResolver(taxProfileSchema),
    defaultValues: {
      userId: selectedInvestorId || '',
      country: '',
      interests: [],
      annualEarningsGbp: '',
      cgtAllowanceGbp: '',
    },
  });

  // Create simplified schema for portfolio holdings form
  const holdingFormSchema = z.object({
    accountId: z.string().min(1, 'Please select an account for this holding'),
    assetType: z.string().min(1, 'Asset type is required'),
    symbol: z.string().min(1, 'Symbol is required'),
    name: z.string().min(1, 'Name is required'),
    quantity: z.string().min(1, 'Quantity is required'),
    costBasisGbp: z.string().min(1, 'Cost basis is required'),
    currentPriceGbp: z.string().min(1, 'Current price is required'),
    provider: z.string().optional(),
  });

  type HoldingFormData = z.infer<typeof holdingFormSchema>;

  const holdingForm = useForm<HoldingFormData>({
    resolver: zodResolver(holdingFormSchema),
    defaultValues: {
      accountId: '',
      assetType: '',
      symbol: '',
      name: '',
      quantity: '',
      costBasisGbp: '',
      currentPriceGbp: '',
      provider: 'Manual',
    },
  });

  // Update preferences form when data loads
  useEffect(() => {
    if (preferencesData && selectedInvestorId) {
      preferencesForm.reset({
        userId: selectedInvestorId,
        riskBand: preferencesData.riskBand || '',
        ticketMinGbp: preferencesData.ticketMinGbp || '',
        ticketMaxGbp: preferencesData.ticketMaxGbp || '',
        regions: preferencesData.regions || [],
        focusSectors: preferencesData.focusSectors || [],
        existingInvestments: preferencesData.existingInvestments || [],
        investmentInterests: preferencesData.investmentInterests || [],
      });
    }
  }, [preferencesData, selectedInvestorId, preferencesForm]);

  // Update tax profile form when data loads
  useEffect(() => {
    if (taxProfileData && selectedInvestorId) {
      taxProfileForm.reset({
        userId: selectedInvestorId,
        country: taxProfileData.country || '',
        interests: taxProfileData.interests || [],
        annualEarningsGbp: taxProfileData.annualEarningsGbp || '',
        cgtAllowanceGbp: taxProfileData.cgtAllowanceGbp || '',
      });
    }
  }, [taxProfileData, selectedInvestorId, taxProfileForm]);

  // Load investor data when selected
  const handleInvestorSelect = (investorId: string) => {
    const investor = demoInvestors.find(inv => inv.userId === investorId);
    if (investor) {
      // Update global context
      setSelectedInvestor({
        userId: investor.userId,
        name: investor.name,
        investorType: investor.investorType
      });
      
      // Initialize portfolio holdings for this investor
      setCurrentInvestor(investorId);
      
      // Reset forms with investor data
      investorForm.reset({
        userId: investorId,
        name: investor.name,
        investorType: investor.investorType,
      });
      
      // Clear preferences form immediately when switching investors
      preferencesForm.reset({
        userId: investorId,
        riskBand: '',
        ticketMinGbp: '',
        ticketMaxGbp: '',
        regions: [],
        focusSectors: [],
        existingInvestments: [],
        investmentInterests: [],
      });
      
      taxProfileForm.reset({
        userId: investorId,
        country: investor.country || '',
        interests: [],
        annualEarningsGbp: '',
        cgtAllowanceGbp: '',
      });

      portfolioAccountForm.reset({
        userId: investorId,
        provider: '',
        accountType: '',
        currency: 'GBP',
        connected: false,
        currentBalanceGbp: '',
        cashBalanceGbp: '',
      });
      
      propertyForm.reset({
        uprn: '',
        titleNumber: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        postcode: '',
        country: 'UK',
        latitude: '',
        longitude: '',
        propertyType: 'residential',
        bedrooms: '',
        floorAreaSqm: '',
        yearBuilt: '',
        epcRating: '',
        userId: investorId,
        ownershipType: 'direct',
        sharePct: 100,
        acquisitionDate: '',
        acquisitionPriceGbp: '',
        acquisitionCostsGbp: '',
        isPrimaryResidence: false,
      });

      alternativeInvestmentForm.reset({
        userId: investorId,
        investmentType: '',
        name: '',
        description: '',
        investmentDateUk: '',
        maturityDateUk: '',
        investmentAmountGbp: '',
        currentValueGbp: '',
        targetReturnPct: '',
        actualReturnPct: '',
        riskRating: '',
        liquidityPeriod: '',
        minimumInvestment: '',
        fees: '',
        taxWrapperEligible: false,
        taxWrapperType: '',
        documentsUrl: '',
        notes: '',
      });

      holdingForm.reset({
        accountId: '',
        assetType: '',
        symbol: '',
        name: '',
        quantity: '',
        costBasisGbp: '',
        currentPriceGbp: '',
        provider: 'Manual',
      });
    }
  };

  // Add new investor mutation
  const addInvestorMutation = useMutation({
    mutationFn: async (investorData: InsertInvestor) => {
      return fetch('/api/investors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(investorData),
      }).then(res => res.json());
    },
    onSuccess: (newInvestor) => {
      setDemoInvestors(prev => [...prev, {
        userId: newInvestor.userId,
        name: newInvestor.name,
        investorType: newInvestor.investorType,
        riskBand: undefined,
        country: undefined
      }]);
      setNewInvestorName('');
      setSelectedInvestor({
        userId: newInvestor.userId,
        name: newInvestor.name,
        investorType: newInvestor.investorType
      });
      handleInvestorSelect(newInvestor.userId);
      
      toast({
        title: 'Investor Saved',
        description: `${newInvestor.name} has been saved to the database.`,
      });
    },
    onError: () => {
      toast({
        title: 'Save Failed',
        description: 'Failed to save investor to database.',
        variant: 'destructive',
      });
    }
  });

  // Add new investor
  const handleAddInvestor = () => {
    if (!newInvestorName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter a name for the new investor.',
        variant: 'destructive',
      });
      return;
    }

    const investorData: InsertInvestor = {
      userId: `demo-${Date.now()}`,
      name: newInvestorName,
      investorType: 'Angel',
    };

    addInvestorMutation.mutate(investorData);
  };

  // Delete investor mutation
  const deleteInvestorMutation = useMutation({
    mutationFn: async (investorId: string) => {
      return fetch(`/api/investors/${investorId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: (_, investorId) => {
      setDemoInvestors(prev => prev.filter(inv => inv.userId !== investorId));
      if (selectedInvestorId === investorId) {
        setSelectedInvestor(null);
      }
      toast({
        title: 'Investor Deleted',
        description: 'The investor has been permanently removed.',
      });
    },
    onError: () => {
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete investor from database.',
        variant: 'destructive',
      });
    }
  });

  // Delete investor
  const handleDeleteInvestor = (investorId: string) => {
    deleteInvestorMutation.mutate(investorId);
  };

  // Save investor mutation
  const updateInvestorMutation = useMutation({
    mutationFn: async (data: { userId: string; investorType: string }) => {
      return fetch(`/api/investors/${data.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ investorType: data.investorType }),
      });
    },
    onSuccess: (_, data) => {
      setDemoInvestors(prev => prev.map(inv => 
        inv.userId === data.userId 
          ? { ...inv, investorType: data.investorType }
          : inv
      ));
      
      toast({
        title: 'Investor Updated',
        description: 'Basic investor information has been saved to database.',
      });
    },
    onError: () => {
      toast({
        title: 'Update Failed',
        description: 'Failed to update investor in database.',
        variant: 'destructive',
      });
    }
  });

  const handleSaveInvestor = (data: InvestorFormData) => {
    if (!selectedInvestorId) return;
    
    updateInvestorMutation.mutate({
      userId: selectedInvestorId,
      investorType: data.investorType || 'Angel',
    });
  };

  // Properties form
  const propertyForm = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      uprn: '',
      titleNumber: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      postcode: '',
      country: 'UK',
      latitude: '',
      longitude: '',
      propertyType: 'residential',
      bedrooms: '',
      floorAreaSqm: '',
      yearBuilt: '',
      epcRating: '',
      userId: selectedInvestorId || '',
      ownershipType: 'direct',
      sharePct: 100,
      acquisitionDate: '',
      acquisitionPriceGbp: '',
      acquisitionCostsGbp: '',
      isPrimaryResidence: false,
    },
  });

  const alternativeInvestmentForm = useForm<AlternativeInvestmentFormData>({
    resolver: zodResolver(alternativeInvestmentSchema),
    defaultValues: {
      userId: selectedInvestorId || '',
      investmentType: '',
      name: '',
      description: '',
      investmentDateUk: '',
      maturityDateUk: '',
      investmentAmountGbp: '',
      currentValueGbp: '',
      targetReturnPct: '',
      actualReturnPct: '',
      riskRating: '',
      liquidityPeriod: '',
      minimumInvestment: '',
      fees: '',
      taxWrapperEligible: false,
      taxWrapperType: '',
      documentsUrl: '',
      notes: '',
    },
  });

  // Properties mutations
  const createPropertyMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      console.log('Sending property data to API:', data);
      
      // Clean the data - convert empty strings to null for numeric fields
      const cleanedData = {
        ...data,
        latitude: data.latitude === '' ? null : data.latitude,
        longitude: data.longitude === '' ? null : data.longitude,
        floorAreaSqm: data.floorAreaSqm === '' ? null : data.floorAreaSqm,
        acquisitionPriceGbp: data.acquisitionPriceGbp === '' ? null : data.acquisitionPriceGbp,
        acquisitionCostsGbp: data.acquisitionCostsGbp === '' ? null : data.acquisitionCostsGbp,
      };
      
      console.log('Cleaned property data:', cleanedData);
      
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('API Success Response:', result);
      return result;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Property added successfully'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/properties', selectedInvestorId] });
      propertyForm.reset();
    },
    onError: (error) => {
      console.error('Property creation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to add property: ${error.message}`
      });
    },
  });

  // Save preferences mutation
  const savePreferencesMutation = useMutation({
    mutationFn: async (data: PreferencesFormData) => {
      if (!selectedInvestorId) throw new Error('No investor selected');
      return fetch(`/api/investors/${selectedInvestorId}/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Preferences Updated', 
        description: 'Investment preferences have been saved successfully.',
      });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save preferences. Please try again.',
      });
    }
  });

  const handleSavePreferences = (data: PreferencesFormData) => {
    savePreferencesMutation.mutate(data);
  };

  // Save tax profile mutation
  const saveTaxProfileMutation = useMutation({
    mutationFn: async (data: TaxProfileFormData) => {
      if (!selectedInvestorId) throw new Error('No investor selected');
      return fetch(`/api/investors/${selectedInvestorId}/tax-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/investors', selectedInvestorId, 'tax-profile'] });
      toast({
        title: 'Tax Profile Updated',
        description: 'Tax profile information has been saved successfully.',
      });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save tax profile. Please try again.',
      });
    }
  });

  const handleSaveTaxProfile = (data: TaxProfileFormData) => {
    saveTaxProfileMutation.mutate(data);
  };

  // Handle adding portfolio holding
  const handleAddHolding = async (data: HoldingFormData) => {
    if (!selectedInvestorId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select an investor first.',
      });
      return;
    }

    try {
      // Calculate values
      const quantity = parseFloat(data.quantity);
      const costBasisPerShare = parseFloat(data.costBasisGbp) / quantity;
      const currentPrice = parseFloat(data.currentPriceGbp);

      // Create position object in the format expected by addPosition
      const position = {
        name: data.name,
        ticker: data.symbol,
        market: 'LSE',
        currency: 'GBP',
        quantity: quantity,
        avgCost: costBasisPerShare,
        price: currentPrice,
        sector: 'Unknown',
        country: 'UK',
        asOf: new Date().toISOString().split('T')[0],
        meta: {
          assetType: data.assetType,
          provider: data.provider || 'Manual',
          accountId: data.accountId,
        }
      };

      await addPosition(position);
      
      toast({
        title: 'Success',
        description: 'Portfolio holding added successfully.',
      });

      // Reset the form
      holdingForm.reset({
        accountId: '',
        assetType: '',
        symbol: '',
        name: '',
        quantity: '',
        costBasisGbp: '',
        currentPriceGbp: '',
        provider: 'Manual',
      });
    } catch (error) {
      console.error('Error adding holding:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add portfolio holding. Please try again.',
      });
    }
  };

  // Handle deleting portfolio holding
  const handleDeleteHolding = async (holdingId: string, holdingName: string) => {
    try {
      await removePosition(holdingId);
      toast({
        title: 'Success',
        description: `${holdingName} has been deleted successfully.`,
      });
    } catch (error) {
      console.error('Error deleting holding:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete portfolio holding. Please try again.',
      });
    }
  };

  // Portfolio Account form
  const portfolioAccountForm = useForm<PortfolioAccountFormData>({
    resolver: zodResolver(portfolioAccountSchema),
    defaultValues: {
      userId: selectedInvestorId || '',
      provider: '',
      accountType: '',
      currency: 'GBP',
      connected: false,
      currentBalanceGbp: '',
      cashBalanceGbp: '',
    },
  });

  // Portfolio Account mutations
  const { data: portfolioAccountsData } = useQuery({
    queryKey: ['/api/investors', selectedInvestorId, 'portfolio-accounts'],
    queryFn: () => {
      if (!selectedInvestorId) return [];
      return fetch(`/api/investors/${selectedInvestorId}/portfolio-accounts`).then(res => res.json());
    },
    enabled: !!selectedInvestorId,
  });

  // Properties query
  const { data: propertiesData } = useQuery({
    queryKey: ['/api/properties', selectedInvestorId],
    queryFn: () => {
      if (!selectedInvestorId) return [];
      return fetch(`/api/properties/${selectedInvestorId}`).then(res => res.json());
    },
    enabled: !!selectedInvestorId,
  });

  // Load alternative investments for selected investor
  const { data: alternativesData, isLoading: alternativesLoading } = useQuery({
    queryKey: ['/api/alternatives', selectedInvestorId],
    queryFn: () => {
      if (!selectedInvestorId) return [];
      return fetch(`/api/alternatives/${selectedInvestorId}`).then(res => res.json());
    },
    enabled: !!selectedInvestorId,
  });

  // Alternative investment mutations
  const createAlternativeInvestmentMutation = useMutation({
    mutationFn: async (data: AlternativeInvestmentFormData) => {
      console.log('Submitting alternative investment data:', data);
      const response = await fetch('/api/alternatives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Alternative investment creation failed:', errorData);
        throw new Error(`Failed to create alternative investment: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: (newInvestment) => {
      console.log('Alternative investment created successfully:', newInvestment);
      queryClient.invalidateQueries({ queryKey: ['/api/alternatives', selectedInvestorId] });
      alternativeInvestmentForm.reset({
        userId: selectedInvestorId || '',
        investmentType: '',
        name: '',
        description: '',
        investmentDateUk: '',
        maturityDateUk: '',
        investmentAmountGbp: '',
        currentValueGbp: '',
        targetReturnPct: '',
        actualReturnPct: '',
        riskRating: '',
        liquidityPeriod: '',
        minimumInvestment: '',
        fees: '',
        taxWrapperEligible: false,
        taxWrapperType: '',
        documentsUrl: '',
        notes: '',
      });
      toast({
        title: 'Investment Added',
        description: 'Alternative investment has been added successfully.',
      });
    },
    onError: (error) => {
      console.error('Alternative investment creation error:', error);
      toast({
        title: 'Error',
        description: `Failed to add alternative investment: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  const deleteAlternativeInvestmentMutation = useMutation({
    mutationFn: async (investmentId: string) => {
      const response = await fetch(`/api/alternatives/${investmentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete alternative investment failed:', errorText);
        throw new Error(`Failed to delete alternative investment: ${response.status}`);
      }
      
      return response.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alternatives', selectedInvestorId] });
      toast({
        title: 'Investment Deleted',
        description: 'Alternative investment has been deleted successfully.',
      });
    },
    onError: (error) => {
      console.error('Delete alternative investment error:', error);
      toast({
        title: 'Error',
        description: `Failed to delete alternative investment: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Property ownership query - fetch ownership data for a specific property
  const getPropertyOwnership = async (propertyId: string) => {
    const response = await fetch(`/api/properties/${propertyId}/ownerships`);
    return response.json();
  };

  // Property deletion mutation
  const deletePropertyMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.ok;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Property deleted successfully'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/properties', selectedInvestorId] });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete property'
      });
    },
  });

  const createPortfolioAccountMutation = useMutation({
    mutationFn: async (data: PortfolioAccountFormData) => {
      if (!selectedInvestorId) throw new Error('No investor selected');
      const response = await fetch(`/api/investors/${selectedInvestorId}/portfolio-accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/investors', selectedInvestorId, 'portfolio-accounts'] });
      portfolioAccountForm.reset({
        userId: selectedInvestorId || '',
        provider: '',
        accountType: '',
        currency: 'GBP',
        connected: false,
        currentBalanceGbp: '',
        cashBalanceGbp: '',
      });
      toast({
        title: 'Account Added',
        description: 'Portfolio account has been added successfully.',
      });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add portfolio account. Please try again.',
      });
    }
  });

  const deletePortfolioAccountMutation = useMutation({
    mutationFn: async (accountId: string) => {
      return fetch(`/api/portfolio-accounts/${accountId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/investors', selectedInvestorId, 'portfolio-accounts'] });
      toast({
        title: 'Account Deleted',
        description: 'Portfolio account has been deleted successfully.',
      });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete portfolio account.',
      });
    }
  });

  const handleAddPortfolioAccount = (data: PortfolioAccountFormData) => {
    createPortfolioAccountMutation.mutate(data);
  };

  const handleDeletePortfolioAccount = (accountId: string) => {
    deletePortfolioAccountMutation.mutate(accountId);
  };

  const renderInvestorManagement = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Demo Investors
          </CardTitle>
          <CardDescription>
            Manage investor profiles for demo purposes. Select an investor to configure their details below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Investor */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter investor name..."
              value={newInvestorName}
              onChange={(e) => setNewInvestorName(e.target.value)}
              data-testid="input-new-investor-name"
            />
            <Button onClick={handleAddInvestor} data-testid="button-add-investor">
              <Plus className="h-4 w-4 mr-2" />
              Add Investor
            </Button>
          </div>

          {/* Investor List */}
          <div className="space-y-2">
            {demoInvestors.map((investor) => (
              <div
                key={investor.userId}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedInvestorId === investor.userId
                    ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => handleInvestorSelect(investor.userId)}
                data-testid={`card-investor-${investor.userId}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {investor.name}
                    </h3>
                    <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>Type: {investor.investorType}</span>
                      {investor.riskBand && <span>Risk: {investor.riskBand}</span>}
                      {investor.country && <span>Country: {investor.country}</span>}
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteInvestor(investor.userId);
                    }}
                    data-testid={`button-delete-${investor.userId}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedInvestorId && (
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Configure the selected investor's basic details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...investorForm}>
              <form onSubmit={investorForm.handleSubmit(handleSaveInvestor)} className="space-y-4">
                <FormField
                  control={investorForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investor Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter investor name"
                          data-testid="input-investor-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={investorForm.control}
                  name="investorType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investor Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-investor-type">
                            <SelectValue placeholder="Select investor type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Angel">Angel Investor</SelectItem>
                          <SelectItem value="Fund">Fund</SelectItem>
                          <SelectItem value="Family Office">Family Office</SelectItem>
                          <SelectItem value="Corporate">Corporate</SelectItem>
                          <SelectItem value="Government">Government</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" data-testid="button-save-investor">
                  <Save className="h-4 w-4 mr-2" />
                  Save Basic Information
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Investment Preferences
          </CardTitle>
          <CardDescription>
            Configure investment preferences for the selected demo investor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...preferencesForm}>
            <form onSubmit={preferencesForm.handleSubmit(handleSavePreferences)} className="space-y-4">
              <FormField
                control={preferencesForm.control}
                name="riskBand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk Tolerance</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-risk-band">
                          <SelectValue placeholder="Select risk tolerance" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low Risk</SelectItem>
                        <SelectItem value="Moderate">Moderate Risk</SelectItem>
                        <SelectItem value="High">High Risk</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={preferencesForm.control}
                  name="ticketMinGbp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Investment (GBP)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 10000"
                          {...field}
                          data-testid="input-min-investment"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={preferencesForm.control}
                  name="ticketMaxGbp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Investment (GBP)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 500000"
                          {...field}
                          data-testid="input-max-investment"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormItem>
                <FormLabel>Preferred Regions</FormLabel>
                <FormField
                  control={preferencesForm.control}
                  name="regions"
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['UK', 'Europe', 'North America', 'Asia', 'Australia', 'Global'].map((region) => (
                        <div key={region} className="flex items-center space-x-2">
                          <Checkbox 
                            id={region}
                            checked={field.value?.includes(region) || false}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              if (checked) {
                                field.onChange([...current, region]);
                              } else {
                                field.onChange(current.filter((item: string) => item !== region));
                              }
                            }}
                            data-testid={`checkbox-region-${region.toLowerCase().replace(' ', '-')}`}
                          />
                          <label 
                            htmlFor={region}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {region}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </FormItem>

              <FormItem>
                <FormLabel>Focus Sectors</FormLabel>
                <FormDescription>
                  Select the business sectors you prefer to invest in
                </FormDescription>
                <FormField
                  control={preferencesForm.control}
                  name="focusSectors"
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[
                        'Technology', 'Healthcare', 'Financial Services', 'Consumer Goods',
                        'Energy', 'Manufacturing', 'Real Estate', 'Media & Entertainment',
                        'Telecommunications', 'Transportation', 'Education', 'Agriculture',
                        'Retail', 'Construction', 'Aerospace', 'Automotive'
                      ].map((sector, index) => (
                        <div key={sector} className="flex items-center space-x-2">
                          <Checkbox 
                            id={sector}
                            checked={field.value?.includes(index + 1) || false}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              if (checked) {
                                field.onChange([...current, index + 1]);
                              } else {
                                field.onChange(current.filter((item: number) => item !== index + 1));
                              }
                            }}
                            data-testid={`checkbox-sector-${sector.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and')}`}
                          />
                          <label 
                            htmlFor={sector}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {sector}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </FormItem>

              <FormItem>
                <FormLabel>Current Investment Holdings</FormLabel>
                <FormDescription>
                  Select the types of investments you currently hold
                </FormDescription>
                <FormField
                  control={preferencesForm.control}
                  name="existingInvestments"
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[
                        'Public Equity', 'Private Equity', 'Venture Capital', 'Angel Investing',
                        'Real Estate', 'Cryptocurrency', 'Bonds', 'REITs', 'Hedge Funds',
                        'Commodities', 'Fine Art', 'Collectibles', 'Whisky & Spirits', 'Wine',
                        'Classic Cars', 'Watches', 'Peer-to-Peer Lending', 'Infrastructure',
                        'Forestry & Timberland', 'Precious Metals'
                      ].map((investment) => (
                        <div key={investment} className="flex items-center space-x-2">
                          <Checkbox 
                            id={investment}
                            checked={field.value?.includes(investment) || false}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              if (checked) {
                                field.onChange([...current, investment]);
                              } else {
                                field.onChange(current.filter((item: string) => item !== investment));
                              }
                            }}
                            data-testid={`checkbox-investment-${investment.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and')}`}
                          />
                          <label 
                            htmlFor={investment}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {investment}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </FormItem>

              <FormItem>
                <FormLabel>Investment Interests</FormLabel>
                <FormDescription>
                  Select the types of investments you're interested in exploring
                </FormDescription>
                <FormField
                  control={preferencesForm.control}
                  name="investmentInterests"
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[
                        'Seed Stage Startups', 'Growth Stage Companies', 'Pre-IPO Opportunities',
                        'ESG/Impact Investing', 'Technology Sector', 'Healthcare & Biotech',
                        'Green Energy', 'Emerging Markets', 'Property Development',
                        'Fintech Innovation', 'AI & Machine Learning', 'Whisky & Spirits Casks',
                        'Fine Wine Investment', 'Classic Car Collecting', 'Luxury Watches',
                        'Contemporary Art', 'Rare Collectibles', 'Infrastructure Projects',
                        'Forestry & Timber', 'Precious Metals Trading', 'Cryptocurrency Trading'
                      ].map((interest) => (
                        <div key={interest} className="flex items-center space-x-2">
                          <Checkbox 
                            id={interest}
                            checked={field.value?.includes(interest) || false}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              if (checked) {
                                field.onChange([...current, interest]);
                              } else {
                                field.onChange(current.filter((item: string) => item !== interest));
                              }
                            }}
                            data-testid={`checkbox-interest-${interest.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and')}`}
                          />
                          <label 
                            htmlFor={interest}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {interest}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </FormItem>

              <Button 
                type="submit" 
                data-testid="button-save-preferences"
                disabled={savePreferencesMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {savePreferencesMutation.isPending ? 'Saving...' : 'Save Preferences'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );

  const renderTaxProfileTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Tax Profile
          </CardTitle>
          <CardDescription>
            Configure tax-related information for the selected demo investor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...taxProfileForm}>
            <form onSubmit={taxProfileForm.handleSubmit(handleSaveTaxProfile)} className="space-y-4">
              <FormField
                control={taxProfileForm.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Residence Country</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-tax-country">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="Germany">Germany</SelectItem>
                        <SelectItem value="France">France</SelectItem>
                        <SelectItem value="Netherlands">Netherlands</SelectItem>
                        <SelectItem value="Switzerland">Switzerland</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={taxProfileForm.control}
                  name="annualEarningsGbp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Earnings (GBP)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 150000"
                          {...field}
                          data-testid="input-annual-earnings"
                        />
                      </FormControl>
                      <FormDescription>
                        Total annual earnings before tax
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={taxProfileForm.control}
                  name="cgtAllowanceGbp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CGT Allowance (GBP)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 6000"
                          {...field}
                          data-testid="input-cgt-allowance"
                        />
                      </FormControl>
                      <FormDescription>
                        Annual Capital Gains Tax allowance
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormItem>
                <FormLabel>Tax Schemes of Interest</FormLabel>
                <FormDescription>
                  Select tax schemes that are relevant for this investor profile.
                </FormDescription>
                <FormField
                  control={taxProfileForm.control}
                  name="interests"
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['EIS', 'SEIS', 'VCT', 'CGT Relief', 'Pension Scheme', 'ISA'].map((scheme) => (
                        <div key={scheme} className="flex items-center space-x-2">
                          <Checkbox 
                            id={scheme}
                            checked={field.value?.includes(scheme) || false}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              if (checked) {
                                field.onChange([...current, scheme]);
                              } else {
                                field.onChange(current.filter((item: string) => item !== scheme));
                              }
                            }}
                            data-testid={`checkbox-tax-${scheme.toLowerCase().replace(' ', '-')}`}
                          />
                          <label 
                            htmlFor={scheme}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {scheme}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </FormItem>

              <Button 
                type="submit" 
                data-testid="button-save-tax-profile"
                disabled={saveTaxProfileMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {saveTaxProfileMutation.isPending ? 'Saving...' : 'Save Tax Profile'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );

  const renderPortfolioAccountsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Portfolio Accounts
          </CardTitle>
          <CardDescription>
            Add demo brokerage, cash, and private investment accounts for this investor.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Account Form */}
          <Form {...portfolioAccountForm}>
            <form onSubmit={portfolioAccountForm.handleSubmit(handleAddPortfolioAccount)} className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={portfolioAccountForm.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., HL, AJ Bell" data-testid="input-account-provider" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={portfolioAccountForm.control}
                  name="accountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-account-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="brokerage">Brokerage</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="pension">Pension</SelectItem>
                          <SelectItem value="isa">ISA</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={portfolioAccountForm.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-currency">
                            <SelectValue placeholder="Currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={portfolioAccountForm.control}
                  name="currentBalanceGbp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Balance (GBP)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="0.00" type="number" step="0.01" data-testid="input-current-balance" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={portfolioAccountForm.control}
                  name="cashBalanceGbp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cash Balance (GBP)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="0.00" type="number" step="0.01" data-testid="input-cash-balance" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" data-testid="button-add-account" disabled={createPortfolioAccountMutation.isPending}>
                <Plus className="h-4 w-4 mr-2" />
                {createPortfolioAccountMutation.isPending ? 'Adding...' : 'Add Account'}
              </Button>
            </form>
          </Form>

          {/* Accounts List */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Portfolio Accounts</h4>
            {portfolioAccountsData && portfolioAccountsData.length > 0 ? (
              portfolioAccountsData.map((account: any) => (
                <div key={account.id} className="p-4 bg-white dark:bg-gray-700 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-gray-100">{account.provider}</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {account.accountType} Account • {account.currency} • {account.connected ? 'Connected' : 'Not Connected'}
                      </p>
                      {(account.currentBalanceGbp || account.cashBalanceGbp) && (
                        <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                          {account.currentBalanceGbp && <span>Balance: £{parseFloat(account.currentBalanceGbp).toLocaleString()}</span>}
                          {account.currentBalanceGbp && account.cashBalanceGbp && <span className="mx-2">•</span>}
                          {account.cashBalanceGbp && <span>Cash: £{parseFloat(account.cashBalanceGbp).toLocaleString()}</span>}
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      data-testid={`button-delete-account-${account.id}`}
                      onClick={() => handleDeletePortfolioAccount(account.id)}
                      disabled={deletePortfolioAccountMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">No portfolio accounts yet. Add one above to get started.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPortfolioHoldingsTab = () => (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Portfolio Holdings
            </CardTitle>
            <CardDescription>
              Add demo investments and positions for this investor's portfolio.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
          {/* Add Holding Form */}
          <Form {...holdingForm}>
            <form onSubmit={holdingForm.handleSubmit(handleAddHolding)} className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="space-y-4">
                {/* Account Selection - Required */}
                <FormField
                  control={holdingForm.control}
                  name="accountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-red-600 dark:text-red-400">Account (Required) *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-holding-account">
                            <SelectValue placeholder="Select account for this holding" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {portfolioAccountsData && portfolioAccountsData.length > 0 ? (
                            portfolioAccountsData.map((account: any) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.provider && account.accountType 
                                  ? `${account.provider} - ${account.accountType}`
                                  : account.provider || account.accountType || `Account ${account.id.slice(0, 8)}`
                                }
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-accounts" disabled>No accounts available - add one first</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={holdingForm.control}
                    name="assetType"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger data-testid="select-asset-type">
                              <SelectValue placeholder="Asset Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equity">Equity</SelectItem>
                              <SelectItem value="fund">Fund</SelectItem>
                              <SelectItem value="crypto">Crypto</SelectItem>
                              <SelectItem value="private">Private</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={holdingForm.control}
                    name="symbol"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} placeholder="Symbol (e.g., AAPL)" data-testid="input-symbol" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={holdingForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} placeholder="Company/Asset Name" data-testid="input-asset-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={holdingForm.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} placeholder="Quantity" data-testid="input-quantity" type="number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={holdingForm.control}
                    name="costBasisGbp"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} placeholder="Total Cost Basis (GBP)" data-testid="input-cost-basis" type="number" step="0.01" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={holdingForm.control}
                    name="currentPriceGbp"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} placeholder="Current Price (GBP)" data-testid="input-current-price" type="number" step="0.01" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Value: £{holdingForm.watch('quantity') && holdingForm.watch('currentPriceGbp') 
                        ? (parseFloat(holdingForm.watch('quantity') || '0') * parseFloat(holdingForm.watch('currentPriceGbp') || '0')).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        : '0.00'}
                    </span>
                  </div>
                </div>
                <FormField
                  control={holdingForm.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} placeholder="Provider" data-testid="input-holding-provider" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" data-testid="button-add-holding" disabled={holdingForm.formState.isSubmitting}>
                  <Plus className="h-4 w-4 mr-2" />
                  {holdingForm.formState.isSubmitting ? 'Adding...' : 'Add Holding'}
                </Button>
              </div>
            </form>
          </Form>

          {/* Holdings List */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Current Holdings</h4>
            {portfolioLoading ? (
              <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border">
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading portfolio holdings...</p>
              </div>
            ) : portfolioPositions.length > 0 ? (
              portfolioPositions.map((position) => {
                const currentValue = position.quantity * position.price;
                const costBasis = position.quantity * position.avgCost;
                const gainLoss = currentValue - costBasis;
                const gainLossColor = gainLoss >= 0 ? 'text-green-600' : 'text-red-600';
                
                return (
                  <div key={position.id} className="p-4 bg-white dark:bg-gray-700 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-gray-100">{position.name}</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{position.ticker} • {position.meta?.assetType || 'Equity'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Quantity</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{position.quantity}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Cost Basis</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">£{costBasis.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Current Value</p>
                            <p className={`font-medium ${gainLossColor}`}>£{currentValue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        data-testid={`button-delete-holding-${position.id}`}
                        onClick={() => handleDeleteHolding(position.id, position.name)}
                        title={`Delete ${position.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border">
                <p className="text-sm text-gray-600 dark:text-gray-400">No portfolio holdings yet. Add one above to get started.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render Properties tab
  const renderPropertiesTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Property Portfolio
          </CardTitle>
          <CardDescription>
            Manage property investments and real estate holdings for this investor profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...propertyForm}>
            <form onSubmit={propertyForm.handleSubmit((data) => {
              console.log('Property form data:', data);
              createPropertyMutation.mutate(data);
            })} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={propertyForm.control}
                  name="uprn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UPRN</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="100023336956" data-testid="input-uprn" />
                      </FormControl>
                      <FormDescription>
                        UK Unique Property Reference Number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={propertyForm.control}
                  name="titleNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="TGL123456" data-testid="input-title-number" />
                      </FormControl>
                      <FormDescription>
                        HM Land Registry title number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={propertyForm.control}
                  name="addressLine1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="123 Main Street" data-testid="input-address-line1" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={propertyForm.control}
                  name="addressLine2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Apartment, Unit, etc." data-testid="input-address-line2" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={propertyForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="London" data-testid="input-city" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={propertyForm.control}
                  name="postcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postcode</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="SW1A 1AA" data-testid="input-postcode" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={propertyForm.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-property-type">
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="residential">Residential</SelectItem>
                          <SelectItem value="btL">Buy to Let</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                          <SelectItem value="industrial">Industrial</SelectItem>
                          <SelectItem value="land">Land</SelectItem>
                          <SelectItem value="mixed">Mixed Use</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={propertyForm.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          min="0" 
                          onChange={(e) => field.onChange(e.target.value)}
                          data-testid="input-bedrooms" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={propertyForm.control}
                  name="floorAreaSqm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floor Area (sqm)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="120" data-testid="input-floor-area" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={propertyForm.control}
                  name="yearBuilt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Built</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          min="1800" 
                          max="2030"
                          onChange={(e) => field.onChange(e.target.value)}
                          data-testid="input-year-built" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={propertyForm.control}
                  name="epcRating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>EPC Rating</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-epc-rating">
                            <SelectValue placeholder="Select EPC rating" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="A">A (Very Efficient)</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="D">D</SelectItem>
                          <SelectItem value="E">E</SelectItem>
                          <SelectItem value="F">F</SelectItem>
                          <SelectItem value="G">G (Least Efficient)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Energy Performance Certificate rating
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={propertyForm.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="51.5074" data-testid="input-latitude" />
                      </FormControl>
                      <FormDescription>
                        GPS latitude coordinate
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={propertyForm.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="-0.1278" data-testid="input-longitude" />
                      </FormControl>
                      <FormDescription>
                        GPS longitude coordinate
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="text-lg font-semibold mb-4">Ownership Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={propertyForm.control}
                    name="ownershipType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ownership Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-ownership-type">
                              <SelectValue placeholder="Select ownership type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="direct">Direct</SelectItem>
                            <SelectItem value="spv">SPV/Company</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={propertyForm.control}
                    name="sharePct"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ownership Share (%)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min="1" 
                            max="100"
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 100)}
                            data-testid="input-share-pct" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={propertyForm.control}
                    name="acquisitionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Acquisition Date</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" data-testid="input-acquisition-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={propertyForm.control}
                    name="acquisitionPriceGbp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Acquisition Price (£)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="450000" data-testid="input-acquisition-price" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={propertyForm.control}
                    name="acquisitionCostsGbp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Acquisition Costs (£)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="25000" data-testid="input-acquisition-costs" />
                        </FormControl>
                        <FormDescription>
                          Stamp duty, legal fees, broker fees, etc.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={propertyForm.control}
                    name="isPrimaryResidence"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-primary-residence"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Primary Residence</FormLabel>
                          <FormDescription>
                            Is this the investor's primary residence?
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={createPropertyMutation.isPending}
                  data-testid="button-save-property"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {createPropertyMutation.isPending ? 'Saving...' : 'Add Property'}
                </Button>
              </div>
            </form>
          </Form>

          {/* Properties List */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Property Portfolio</h4>
            {propertiesData && propertiesData.length > 0 ? (
              propertiesData.map((property: any) => (
                <div key={property.id} className="p-4 bg-white dark:bg-gray-700 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-gray-100">
                            {property.addressLine1}
                            {property.addressLine2 && `, ${property.addressLine2}`}
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {property.city}, {property.postcode} • {property.propertyType}
                          </p>
                          {property.uprn && (
                            <p className="text-xs text-gray-500 dark:text-gray-500">UPRN: {property.uprn}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Details</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {property.bedrooms ? `${property.bedrooms} bed` : 'N/A'}
                            {property.floorAreaSqm && ` • ${property.floorAreaSqm}m²`}
                          </p>
                          {property.epcRating && (
                            <p className="text-xs text-gray-500 dark:text-gray-500">EPC: {property.epcRating}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Added</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {new Date(property.createdAt).toLocaleDateString('en-GB')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            data-testid={`button-view-property-${property.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Property Details</DialogTitle>
                            <DialogDescription>
                              Complete information for {property.addressLine1}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Address Information</h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="font-medium text-gray-600 dark:text-gray-400">Address:</span>
                                  <p className="text-gray-900 dark:text-gray-100">
                                    {property.addressLine1}
                                    {property.addressLine2 && <br />}{property.addressLine2}
                                    <br />{property.city}, {property.postcode}
                                    <br />{property.country}
                                  </p>
                                </div>
                                {property.uprn && (
                                  <div>
                                    <span className="font-medium text-gray-600 dark:text-gray-400">UPRN:</span>
                                    <p className="text-gray-900 dark:text-gray-100">{property.uprn}</p>
                                  </div>
                                )}
                                {property.titleNumber && (
                                  <div>
                                    <span className="font-medium text-gray-600 dark:text-gray-400">Title Number:</span>
                                    <p className="text-gray-900 dark:text-gray-100">{property.titleNumber}</p>
                                  </div>
                                )}
                                {(property.latitude || property.longitude) && (
                                  <div>
                                    <span className="font-medium text-gray-600 dark:text-gray-400">Coordinates:</span>
                                    <p className="text-gray-900 dark:text-gray-100">{property.latitude}, {property.longitude}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Property Details</h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="font-medium text-gray-600 dark:text-gray-400">Type:</span>
                                  <p className="text-gray-900 dark:text-gray-100 capitalize">{property.propertyType}</p>
                                </div>
                                {property.bedrooms && (
                                  <div>
                                    <span className="font-medium text-gray-600 dark:text-gray-400">Bedrooms:</span>
                                    <p className="text-gray-900 dark:text-gray-100">{property.bedrooms}</p>
                                  </div>
                                )}
                                {property.floorAreaSqm && (
                                  <div>
                                    <span className="font-medium text-gray-600 dark:text-gray-400">Floor Area:</span>
                                    <p className="text-gray-900 dark:text-gray-100">{property.floorAreaSqm} m²</p>
                                  </div>
                                )}
                                {property.yearBuilt && (
                                  <div>
                                    <span className="font-medium text-gray-600 dark:text-gray-400">Year Built:</span>
                                    <p className="text-gray-900 dark:text-gray-100">{property.yearBuilt}</p>
                                  </div>
                                )}
                                {property.epcRating && (
                                  <div>
                                    <span className="font-medium text-gray-600 dark:text-gray-400">EPC Rating:</span>
                                    <p className="text-gray-900 dark:text-gray-100">{property.epcRating}</p>
                                  </div>
                                )}
                                <div>
                                  <span className="font-medium text-gray-600 dark:text-gray-400">Added:</span>
                                  <p className="text-gray-900 dark:text-gray-100">
                                    {new Date(property.createdAt).toLocaleDateString('en-GB', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric'
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <PropertyOwnershipView propertyId={property.id} />
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        disabled={deletePropertyMutation.isPending}
                        data-testid={`button-delete-property-${property.id}`}
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
                            deletePropertyMutation.mutate(property.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border">
                <p className="text-sm text-gray-600 dark:text-gray-400">No properties yet. Add one above to get started.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render Alternatives tab
  const renderAlternativesTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Alternative Investments
          </CardTitle>
          <CardDescription>
            Track private equity, venture capital, hedge funds, real estate funds, commodities, and other non-traditional investments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...alternativeInvestmentForm}>
            <form onSubmit={alternativeInvestmentForm.handleSubmit((data) => {
              console.log('Form submitted with data:', data);
              if (!selectedInvestorId) {
                console.error('No investor selected');
                toast({
                  title: 'Error',
                  description: 'Please select an investor first.',
                  variant: 'destructive',
                });
                return;
              }
              
              // Convert empty strings to undefined for optional fields
              const cleanedData = {
                ...data,
                userId: selectedInvestorId,
                description: data.description || undefined,
                investmentDateUk: data.investmentDateUk || undefined,
                maturityDateUk: data.maturityDateUk || undefined,
                investmentAmountGbp: data.investmentAmountGbp || undefined,
                currentValueGbp: data.currentValueGbp || undefined,
                targetReturnPct: data.targetReturnPct || undefined,
                actualReturnPct: data.actualReturnPct || undefined,
                riskRating: data.riskRating || undefined,
                liquidityPeriod: data.liquidityPeriod || undefined,
                minimumInvestment: data.minimumInvestment || undefined,
                fees: data.fees || undefined,
                taxWrapperType: data.taxWrapperType || undefined,
                documentsUrl: data.documentsUrl || undefined,
                notes: data.notes || undefined,
              };
              
              console.log('Submitting cleaned data:', cleanedData);
              createAlternativeInvestmentMutation.mutate(cleanedData);
            })} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={alternativeInvestmentForm.control}
                  name="investmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-investment-type">
                            <SelectValue placeholder="Select investment type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="private-equity">Private Equity</SelectItem>
                          <SelectItem value="venture-capital">Venture Capital</SelectItem>
                          <SelectItem value="hedge-fund">Hedge Fund</SelectItem>
                          <SelectItem value="real-estate-fund">Real Estate Fund</SelectItem>
                          <SelectItem value="commodity">Commodity</SelectItem>
                          <SelectItem value="cryptocurrency">Cryptocurrency</SelectItem>
                          <SelectItem value="collectible">Collectible</SelectItem>
                          <SelectItem value="eis">EIS Investment</SelectItem>
                          <SelectItem value="seis">SEIS Investment</SelectItem>
                          <SelectItem value="vct">VCT Investment</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={alternativeInvestmentForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Acme Venture Capital Fund III" data-testid="input-investment-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={alternativeInvestmentForm.control}
                  name="investmentAmountGbp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment Amount (GBP)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="50000" data-testid="input-investment-amount" />
                      </FormControl>
                      <FormDescription>
                        Amount invested in GBP
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={alternativeInvestmentForm.control}
                  name="currentValueGbp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Value (GBP)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="75000" data-testid="input-current-value" />
                      </FormControl>
                      <FormDescription>
                        Current estimated value in GBP
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={alternativeInvestmentForm.control}
                  name="investmentDateUk"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" data-testid="input-investment-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={alternativeInvestmentForm.control}
                  name="maturityDateUk"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maturity Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" data-testid="input-maturity-date" />
                      </FormControl>
                      <FormDescription>
                        Expected exit or maturity date
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={alternativeInvestmentForm.control}
                  name="targetReturnPct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Return (%)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="15.5" data-testid="input-target-return" />
                      </FormControl>
                      <FormDescription>
                        Expected annual return percentage
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={alternativeInvestmentForm.control}
                  name="riskRating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Rating</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-risk-rating">
                            <SelectValue placeholder="Select risk level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low Risk</SelectItem>
                          <SelectItem value="medium">Medium Risk</SelectItem>
                          <SelectItem value="high">High Risk</SelectItem>
                          <SelectItem value="very-high">Very High Risk</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={alternativeInvestmentForm.control}
                  name="liquidityPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Liquidity Period</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="5 years" data-testid="input-liquidity-period" />
                      </FormControl>
                      <FormDescription>
                        How long before funds can be withdrawn
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={alternativeInvestmentForm.control}
                  name="fees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fees</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="2% management fee + 20% performance fee" data-testid="input-fees" />
                      </FormControl>
                      <FormDescription>
                        Management and performance fees
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={alternativeInvestmentForm.control}
                  name="taxWrapperEligible"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-tax-wrapper-eligible"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Tax Wrapper Eligible
                        </FormLabel>
                        <FormDescription>
                          Eligible for EIS, SEIS, VCT or other tax relief
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                {alternativeInvestmentForm.watch('taxWrapperEligible') && (
                  <FormField
                    control={alternativeInvestmentForm.control}
                    name="taxWrapperType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax Wrapper Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-tax-wrapper-type">
                              <SelectValue placeholder="Select tax wrapper" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="eis">EIS (Enterprise Investment Scheme)</SelectItem>
                            <SelectItem value="seis">SEIS (Seed Enterprise Investment Scheme)</SelectItem>
                            <SelectItem value="vct">VCT (Venture Capital Trust)</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <FormField
                control={alternativeInvestmentForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Technology-focused venture capital fund targeting Series A investments" data-testid="input-description" />
                    </FormControl>
                    <FormDescription>
                      Brief description of the investment
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={alternativeInvestmentForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Additional notes about this investment" data-testid="input-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={createAlternativeInvestmentMutation.isPending}
                data-testid="button-add-alternative-investment"
              >
                {createAlternativeInvestmentMutation.isPending ? (
                  'Adding Investment...'
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Alternative Investment
                  </>
                )}
              </Button>
            </form>
          </Form>

          {/* Alternative Investments List */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Current Alternative Investments</h3>
            {alternativesLoading ? (
              <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border">
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading alternative investments...</p>
              </div>
            ) : alternativesData && alternativesData.length > 0 ? (
              alternativesData.map((investment: any) => {
                const investmentAmount = parseFloat(investment.investmentAmountGbp || '0');
                const currentValue = parseFloat(investment.currentValueGbp || '0');
                const returnValue = currentValue - investmentAmount;
                const returnPct = investmentAmount > 0 ? ((returnValue / investmentAmount) * 100) : 0;
                const returnColor = returnValue >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

                return (
                  <div key={investment.id} className="p-4 bg-white dark:bg-gray-700 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-gray-100">{investment.name}</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{investment.investmentType} • {investment.riskRating || 'No rating'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Investment Amount</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">£{investmentAmount.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Current Value</p>
                            <p className={`font-medium ${returnColor}`}>£{currentValue.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Return</p>
                            <p className={`font-medium ${returnColor}`}>
                              {returnValue >= 0 ? '+' : ''}£{returnValue.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} 
                              ({returnPct >= 0 ? '+' : ''}{returnPct.toFixed(1)}%)
                            </p>
                          </div>
                        </div>
                        {investment.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{investment.description}</p>
                        )}
                        {investment.taxWrapperEligible && investment.taxWrapperType && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mt-2">
                            {investment.taxWrapperType.toUpperCase()} Eligible
                          </span>
                        )}
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        disabled={deleteAlternativeInvestmentMutation.isPending}
                        data-testid={`button-delete-alternative-${investment.id}`}
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this alternative investment? This action cannot be undone.')) {
                            deleteAlternativeInvestmentMutation.mutate(investment.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border">
                <p className="text-sm text-gray-600 dark:text-gray-400">No alternative investments yet. Add one above to get started.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Account Settings</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage demo investor profiles for presentations and demonstrations.
            </p>
          </div>

          {/* Investor Selection Section */}
          <div className="mb-8">
            {renderInvestorManagement()}
          </div>

          {/* Configuration Tabs */}
          {selectedInvestorId && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6 mb-8 bg-gray-200 dark:bg-gray-800 p-1 rounded-xl border border-gray-300 dark:border-gray-600">
                <TabsTrigger 
                  value="preferences" 
                  className="data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white data-[state=active]:shadow-md text-gray-700 dark:text-gray-300 font-medium transition-all duration-200 rounded-xl"
                  data-testid="tab-preferences"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Preferences
                </TabsTrigger>
                <TabsTrigger 
                  value="tax-profile" 
                  className="data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white data-[state=active]:shadow-md text-gray-700 dark:text-gray-300 font-medium transition-all duration-200 rounded-xl"
                  data-testid="tab-tax-profile"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Tax Profile
                </TabsTrigger>
                <TabsTrigger 
                  value="portfolio-accounts" 
                  className="data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white data-[state=active]:shadow-md text-gray-700 dark:text-gray-300 font-medium transition-all duration-200 rounded-xl"
                  data-testid="tab-portfolio-accounts"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Accounts
                </TabsTrigger>
                <TabsTrigger 
                  value="portfolio-holdings" 
                  className="data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white data-[state=active]:shadow-md text-gray-700 dark:text-gray-300 font-medium transition-all duration-200 rounded-xl"
                  data-testid="tab-portfolio-holdings"
                >
                  <PieChart className="h-4 w-4 mr-2" />
                  Holdings
                </TabsTrigger>
                <TabsTrigger 
                  value="alternatives" 
                  className="data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white data-[state=active]:shadow-md text-gray-700 dark:text-gray-300 font-medium transition-all duration-200 rounded-xl"
                  data-testid="tab-alternatives"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Alternatives
                </TabsTrigger>
                <TabsTrigger 
                  value="properties" 
                  className="data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white data-[state=active]:shadow-md text-gray-700 dark:text-gray-300 font-medium transition-all duration-200 rounded-xl"
                  data-testid="tab-properties"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Properties
                </TabsTrigger>
              </TabsList>

              <TabsContent value="preferences">
                {renderPreferencesTab()}
              </TabsContent>

              <TabsContent value="tax-profile">
                {renderTaxProfileTab()}
              </TabsContent>

              <TabsContent value="portfolio-accounts">
                {renderPortfolioAccountsTab()}
              </TabsContent>

              <TabsContent value="portfolio-holdings">
                {renderPortfolioHoldingsTab()}
              </TabsContent>

              <TabsContent value="alternatives">
                {renderAlternativesTab()}
              </TabsContent>

              <TabsContent value="properties">
                {renderPropertiesTab()}
              </TabsContent>
            </Tabs>
          )}

          {!selectedInvestorId && (
            <Card className="mt-8">
              <CardContent className="pt-6">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Investor Selected</h3>
                  <p>Please select or add an investor above to configure their profile settings.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}