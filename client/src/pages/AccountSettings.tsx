import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { User, Settings, DollarSign, MapPin, Plus, Trash2, Save, Users, Briefcase, PieChart, Building2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import type { 
  InsertInvestor, InsertInvestorPreferences, InsertTaxProfile,
  InsertPortfolioAccount, InsertPortfolioHolding,
  PortfolioAccount, PortfolioHolding,
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
  accountId: z.string().optional(),
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
  bedrooms: z.number().optional(),
  floorAreaSqm: z.string().optional(),
  yearBuilt: z.number().optional(),
  epcRating: z.string().optional(),
  // Ownership fields
  userId: z.string().min(1, 'User ID is required'),
  ownershipType: z.string().default('direct'),
  sharePct: z.number().min(1).max(100),
  acquisitionDate: z.string().optional(),
  acquisitionPriceGbp: z.string().optional(),
  acquisitionCostsGbp: z.string().optional(),
  isPrimaryResidence: z.boolean().default(false),
});

type InvestorFormData = z.infer<typeof investorSchema>;
type PreferencesFormData = z.infer<typeof preferencesSchema>;
type TaxProfileFormData = z.infer<typeof taxProfileSchema>;
type PortfolioAccountFormData = z.infer<typeof portfolioAccountSchema>;
type PortfolioHoldingFormData = z.infer<typeof portfolioHoldingSchema>;
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

export default function AccountSettings() {
  const { toast } = useToast();
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
      const formattedInvestors = investorsData.map((inv: { userId: string; name: string; investorType: string }) => ({
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
        ...propertyForm.getValues(),
        userId: investorId,
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
      bedrooms: undefined,
      floorAreaSqm: '',
      yearBuilt: undefined,
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

  // Properties mutations
  const createPropertyMutation = useMutation({
    mutationFn: (data: PropertyFormData) => {
      return fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Property added successfully'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      propertyForm.reset();
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add property'
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Select>
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
                <Input placeholder="Symbol (e.g., AAPL)" data-testid="input-symbol" />
              </div>
              <Input placeholder="Company/Asset Name" data-testid="input-asset-name" />
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Quantity" data-testid="input-quantity" />
                <Input placeholder="Cost Basis (GBP)" data-testid="input-cost-basis" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Current Price (GBP)" data-testid="input-current-price" />
                <Input placeholder="Current Value (GBP)" data-testid="input-current-value" />
              </div>
              <Input placeholder="Provider" data-testid="input-holding-provider" />
              <Button className="w-full" data-testid="button-add-holding">
                <Plus className="h-4 w-4 mr-2" />
                Add Holding
              </Button>
            </div>
          </div>

          {/* Holdings List */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Demo Holdings</h4>
            {/* Sample holdings for demo */}
            <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-gray-100">Apple Inc</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">AAPL • Equity</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Quantity</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">50</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Cost Basis</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">£7,500</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Current Value</p>
                      <p className="font-medium text-green-600">£9,200</p>
                    </div>
                  </div>
                </div>
                <Button variant="destructive" size="sm" data-testid="button-delete-holding-1">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-gray-100">Vanguard FTSE 100</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">VUKE • Fund</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Quantity</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">200</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Cost Basis</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">£15,000</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Current Value</p>
                      <p className="font-medium text-green-600">£16,800</p>
                    </div>
                  </div>
                </div>
                <Button variant="destructive" size="sm" data-testid="button-delete-holding-2">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
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
            <form onSubmit={propertyForm.handleSubmit((data) => createPropertyMutation.mutate(data))} className="space-y-4">
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
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
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
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
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
              <TabsList className="grid w-full grid-cols-5 mb-8 bg-gray-200 dark:bg-gray-800 p-1 rounded-xl border border-gray-300 dark:border-gray-600">
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