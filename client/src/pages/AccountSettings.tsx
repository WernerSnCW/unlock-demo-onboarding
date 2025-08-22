import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { User, Settings, DollarSign, MapPin, Plus, Trash2, Save, Users, Briefcase, PieChart, Building2 } from 'lucide-react';
import { z } from 'zod';
import Header from '../components/Header';
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
});

const taxProfileSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  country: z.string().optional(),
  interests: z.array(z.string()).optional(),
});

const portfolioAccountSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  provider: z.string().optional(),
  providerAccountId: z.string().optional(),
  accountType: z.string().optional(),
  currency: z.string().optional(),
  connected: z.boolean().optional(),
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
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().default('UK'),
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
  const [activeTab, setActiveTab] = useState('preferences');
  const [selectedInvestorId, setSelectedInvestorId] = useState<string | null>(null);
  const [newInvestorName, setNewInvestorName] = useState('');

  // Load investors from database
  const { data: investorsData } = useQuery({
    queryKey: ['/api/investors'],
    queryFn: () => fetch('/api/investors').then(res => res.json()),
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
    }
  }, [investorsData]);

  // Form instances
  const investorForm = useForm<InvestorFormData>({
    resolver: zodResolver(investorSchema),
    defaultValues: {
      userId: selectedInvestorId,
      name: '',
      investorType: '',
    },
  });

  const preferencesForm = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      userId: selectedInvestorId,
      riskBand: '',
      ticketMinGbp: '',
      ticketMaxGbp: '',
      regions: [],
      focusSectors: [],
    },
  });

  const taxProfileForm = useForm<TaxProfileFormData>({
    resolver: zodResolver(taxProfileSchema),
    defaultValues: {
      userId: selectedInvestorId,
      country: '',
      interests: [],
    },
  });

  // Load investor data when selected
  const handleInvestorSelect = (investorId: string) => {
    setSelectedInvestorId(investorId);
    const investor = demoInvestors.find(inv => inv.userId === investorId);
    if (investor) {
      investorForm.reset({
        userId: investorId,
        name: investor.name,
        investorType: investor.investorType,
      });
      preferencesForm.reset({
        userId: investorId,
        riskBand: investor.riskBand || '',
        ticketMinGbp: '',
        ticketMaxGbp: '',
        regions: [],
        focusSectors: [],
      });
      taxProfileForm.reset({
        userId: investorId,
        country: investor.country || '',
        interests: [],
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
      setSelectedInvestorId(newInvestor.userId);
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
        setSelectedInvestorId(null);
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
      name: data.name,
      investorType: data.investorType || 'Angel',
    });
  };

  // Properties form
  const propertyForm = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      postcode: '',
      country: 'UK',
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
      return apiRequest('/api/properties', {
        method: 'POST',
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

  // Save preferences
  const handleSavePreferences = (data: PreferencesFormData) => {
    setDemoInvestors(prev => prev.map(inv => 
      inv.userId === selectedInvestorId 
        ? { ...inv, riskBand: data.riskBand || inv.riskBand }
        : inv
    ));
    
    toast({
      title: 'Preferences Updated', 
      description: 'Investment preferences have been saved successfully.',
    });
  };

  // Save tax profile
  const handleSaveTaxProfile = (data: TaxProfileFormData) => {
    setDemoInvestors(prev => prev.map(inv => 
      inv.userId === selectedInvestorId 
        ? { ...inv, country: data.country || inv.country }
        : inv
    ));
    
    toast({
      title: 'Tax Profile Updated',
      description: 'Tax profile information has been saved successfully.',
    });
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
                <div className="flex flex-wrap gap-2 mt-2">
                  {['UK', 'Europe', 'North America', 'Asia', 'Australia', 'Global'].map((region) => (
                    <div key={region} className="flex items-center space-x-2">
                      <Checkbox 
                        id={region}
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
              </FormItem>

              <Button type="submit" data-testid="button-save-preferences">
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
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

              <FormItem>
                <FormLabel>Tax Schemes of Interest</FormLabel>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['EIS', 'SEIS', 'VCT', 'CGT Relief', 'Pension Scheme', 'ISA'].map((scheme) => (
                    <div key={scheme} className="flex items-center space-x-2">
                      <Checkbox 
                        id={scheme}
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
                <FormDescription>
                  Select tax schemes that are relevant for this investor profile.
                </FormDescription>
              </FormItem>

              <Button type="submit" data-testid="button-save-tax-profile">
                <Save className="h-4 w-4 mr-2" />
                Save Tax Profile
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Input placeholder="Provider (e.g., HL, AJ Bell)" data-testid="input-account-provider" />
            <Select>
              <SelectTrigger data-testid="select-account-type">
                <SelectValue placeholder="Account Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brokerage">Brokerage</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="pension">Pension</SelectItem>
                <SelectItem value="isa">ISA</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger data-testid="select-currency">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
            <Button data-testid="button-add-account">
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>

          {/* Accounts List */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Demo Accounts</h4>
            {/* Sample accounts for demo */}
            <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-gray-100">Hargreaves Lansdown</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Brokerage Account • GBP • Connected</p>
                </div>
                <Button variant="destructive" size="sm" data-testid="button-delete-account-1">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-gray-100">Cash ISA</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ISA Account • GBP • Connected</p>
                </div>
                <Button variant="destructive" size="sm" data-testid="button-delete-account-2">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
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
            <form onSubmit={propertyForm.handleSubmit(createPropertyMutation.mutate)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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