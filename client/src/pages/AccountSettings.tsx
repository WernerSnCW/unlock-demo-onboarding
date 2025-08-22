import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { User, Settings, DollarSign, MapPin, Plus, Trash2, Save, Users } from 'lucide-react';
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
import { queryClient } from '@/lib/queryClient';
import type { InsertInvestor, InsertInvestorPreferences, InsertTaxProfile } from '@shared/schema';

// Form schemas
const investorSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
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

type InvestorFormData = z.infer<typeof investorSchema>;
type PreferencesFormData = z.infer<typeof preferencesSchema>;
type TaxProfileFormData = z.infer<typeof taxProfileSchema>;

interface DemoInvestor {
  userId: string;
  name: string;
  investorType: string;
  riskBand?: string;
  country?: string;
}

export default function AccountSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('investors');
  const [selectedInvestorId, setSelectedInvestorId] = useState<string>('');
  const [newInvestorName, setNewInvestorName] = useState('');

  // Mock data for demo investors - in real app this would come from API
  const [demoInvestors, setDemoInvestors] = useState<DemoInvestor[]>([
    {
      userId: 'demo-1',
      name: 'Conservative Pension Fund',
      investorType: 'Fund',
      riskBand: 'Low',
      country: 'UK'
    },
    {
      userId: 'demo-2', 
      name: 'Tech Angel Investor',
      investorType: 'Angel',
      riskBand: 'High',
      country: 'UK'
    },
    {
      userId: 'demo-3',
      name: 'Family Office - Europe',
      investorType: 'Family Office',
      riskBand: 'Moderate',
      country: 'UK'
    }
  ]);

  // Form instances
  const investorForm = useForm<InvestorFormData>({
    resolver: zodResolver(investorSchema),
    defaultValues: {
      userId: selectedInvestorId,
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
    }
  };

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

    const newInvestor: DemoInvestor = {
      userId: `demo-${Date.now()}`,
      name: newInvestorName,
      investorType: 'Angel',
      riskBand: 'Moderate',
      country: 'UK'
    };

    setDemoInvestors(prev => [...prev, newInvestor]);
    setNewInvestorName('');
    setSelectedInvestorId(newInvestor.userId);
    handleInvestorSelect(newInvestor.userId);
    
    toast({
      title: 'Investor Added',
      description: `${newInvestorName} has been added to your demo investors.`,
    });
  };

  // Delete investor
  const handleDeleteInvestor = (investorId: string) => {
    setDemoInvestors(prev => prev.filter(inv => inv.userId !== investorId));
    if (selectedInvestorId === investorId) {
      setSelectedInvestorId('');
    }
    toast({
      title: 'Investor Removed',
      description: 'The investor has been removed from your demo list.',
    });
  };

  // Save investor data
  const handleSaveInvestor = (data: InvestorFormData) => {
    // Update the demo investor in state
    setDemoInvestors(prev => prev.map(inv => 
      inv.userId === selectedInvestorId 
        ? { ...inv, investorType: data.investorType || inv.investorType }
        : inv
    ));
    
    toast({
      title: 'Investor Updated',
      description: 'Investor information has been saved successfully.',
    });
  };

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
      {!selectedInvestorId ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500 dark:text-gray-400">
              Please select an investor from the Investors tab to configure their preferences.
            </div>
          </CardContent>
        </Card>
      ) : (
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
      )}
    </div>
  );

  const renderTaxProfileTab = () => (
    <div className="space-y-6">
      {!selectedInvestorId ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500 dark:text-gray-400">
              Please select an investor from the Investors tab to configure their tax profile.
            </div>
          </CardContent>
        </Card>
      ) : (
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
      )}
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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-200 dark:bg-gray-800 p-1 rounded-xl border border-gray-300 dark:border-gray-600">
              <TabsTrigger 
                value="investors" 
                className="data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white data-[state=active]:shadow-md text-gray-700 dark:text-gray-300 font-medium transition-all duration-200 rounded-xl"
                data-testid="tab-investors"
              >
                <User className="h-4 w-4 mr-2" />
                Investors
              </TabsTrigger>
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
            </TabsList>

            <TabsContent value="investors">
              {renderInvestorManagement()}
            </TabsContent>

            <TabsContent value="preferences">
              {renderPreferencesTab()}
            </TabsContent>

            <TabsContent value="tax-profile">
              {renderTaxProfileTab()}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}