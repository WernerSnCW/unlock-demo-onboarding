import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building, MapPin, Calendar, TrendingUp, Plus, Eye, Edit, Trash2, RefreshCw, PoundSterling, Home, BarChart3, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { insertPropertySchema, insertPropertyOwnershipSchema } from '@shared/schema';

// Form schema for adding new property
const addPropertyFormSchema = insertPropertySchema.extend({
  // Override numeric fields to handle empty strings properly
  floorAreaSqm: z.string().optional().transform(val => val === '' ? undefined : val),
  latitude: z.string().optional().transform(val => val === '' ? undefined : val),
  longitude: z.string().optional().transform(val => val === '' ? undefined : val),
  // Ownership details
  ownershipType: z.enum(['direct', 'spv']).default('direct'),
  sharePct: z.coerce.number().min(0).max(100).default(100),
  acquisitionDate: z.string().optional().transform(val => val === '' ? undefined : val),
  acquisitionPriceGbp: z.string().optional().transform(val => val === '' ? undefined : val),
  acquisitionCostsGbp: z.string().optional().transform(val => val === '' ? undefined : val),
  isPrimaryResidence: z.boolean().default(false),
});

type AddPropertyFormData = z.infer<typeof addPropertyFormSchema>;

interface Property {
  id: string;
  uprn?: string;
  titleNumber?: string;
  addressLine1: string;
  addressLine2?: string;
  city?: string;
  postcode?: string;
  country: string;
  propertyType?: string;
  bedrooms?: string;
  floorAreaSqm?: string;
  yearBuilt?: string;
  epcRating?: string;
  createdAt: string;
  updatedAt: string;
}

interface PropertyValuation {
  estimate: number;
  range: { min: number; max: number };
  method: string;
  confidence: string;
  regionName: string;
  hpiBaseline: number;
  comparables: number;
  explainability: {
    hpiBaseline: number;
    hpiUpliftFactor: number;
    comparableAverage?: number;
    methodUsed: string;
    regionAccuracy: string;
  };
}

interface PropertyPriceData {
  postcode: string;
  price: number;
  dateOfTransfer: string;
  propertyType: string;
  address: string;
}

interface PropertyWithValuation extends Property {
  acquisitionPriceGbp?: string;
  acquisitionDate?: string;
  valuation?: PropertyValuation;
  marketComparable?: PropertyPriceData;
  isValuationLoading?: boolean;
  latestValuation?: {
    id: string;
    valueGbp: number;
    valuationDate: string;
    method: string;
    source: string;
    confidence: number;
    valuationRangeMinGbp: number;
    valuationRangeMaxGbp: number;
    comparableCount: number;
    hpiBaseValueGbp: number;
    comparableAvgValueGbp: number;
    regionName: string;
    createdAt: string;
  };
  latestPurchasePrice?: {
    price: number;
    dateOfTransfer: string;
  };
}

interface PropertyPortfolioProps {
  userId: string;
  className?: string;
}

// AddPropertyModal component
function AddPropertyModal({ userId, onSuccess }: { userId: string; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<AddPropertyFormData>({
    resolver: zodResolver(addPropertyFormSchema),
    defaultValues: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      postcode: '',
      country: 'UK',
      propertyType: '',
      bedrooms: '',
      floorAreaSqm: '',
      yearBuilt: '',
      epcRating: '',
      ownershipType: 'direct',
      sharePct: 100,
      acquisitionDate: '',
      acquisitionPriceGbp: '',
      acquisitionCostsGbp: '',
      isPrimaryResidence: false,
    },
  });

  const addPropertyMutation = useMutation({
    mutationFn: async (data: AddPropertyFormData) => {
      // Separate property and ownership data
      const { ownershipType, sharePct, acquisitionDate, acquisitionPriceGbp, acquisitionCostsGbp, isPrimaryResidence, ...propertyData } = data;
      
      // Clean the property data - convert empty strings to null for numeric fields
      const cleanedPropertyData = {
        ...propertyData,
        floorAreaSqm: propertyData.floorAreaSqm || null,
        latitude: propertyData.latitude || null,
        longitude: propertyData.longitude || null,
      };
      
      console.log('Sending property data:', cleanedPropertyData);
      
      // Create property
      const propertyResponse = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedPropertyData),
      });
      
      if (!propertyResponse.ok) {
        const errorData = await propertyResponse.json();
        console.error('Property creation failed:', errorData);
        throw new Error(errorData.message || 'Failed to create property');
      }
      
      const property = await propertyResponse.json();
      
      // Create ownership record
      const ownershipData = {
        propertyId: property.id,
        userId,
        ownershipType,
        sharePct: sharePct.toString(), // Convert to string as expected by Zod schema
        acquisitionDate: acquisitionDate || undefined,
        acquisitionPriceGbp: acquisitionPriceGbp || undefined,
        acquisitionCostsGbp: acquisitionCostsGbp || undefined,
        isPrimaryResidence,
      };
      
      console.log('Sending ownership data:', ownershipData);
      
      const ownershipResponse = await fetch(`/api/properties/${property.id}/ownerships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ownershipData),
      });
      
      if (!ownershipResponse.ok) {
        const errorData = await ownershipResponse.json();
        console.error('Ownership creation failed:', errorData);
        throw new Error(errorData.message || 'Failed to create property ownership');
      }
      
      return property;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties', userId] });
      form.reset();
      setOpen(false);
      onSuccess();
    },
    onError: (error) => {
      console.error('Add property failed:', error);
    }
  });

  const onSubmit = (data: AddPropertyFormData) => {
    addPropertyMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          data-testid="button-add-property"
          className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">Add New Property</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Add a property to your portfolio and set ownership details.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Address Section */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Property Address</h4>
              
              <FormField
                control={form.control}
                name="addressLine1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-900 dark:text-gray-100">Address Line 1 *</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main Street" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="addressLine2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-900 dark:text-gray-100">Address Line 2</FormLabel>
                    <FormControl>
                      <Input placeholder="Apartment, suite, etc." {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-900 dark:text-gray-100">City</FormLabel>
                      <FormControl>
                        <Input placeholder="London" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="postcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-900 dark:text-gray-100">Postcode</FormLabel>
                      <FormControl>
                        <Input placeholder="SW1A 1AA" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Property Details Section */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Property Details</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-900 dark:text-gray-100">Property Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger className="text-gray-900 dark:text-gray-100">
                            <SelectValue placeholder="Select type" className="text-gray-900 dark:text-gray-100" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                          <SelectItem value="detached" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Detached</SelectItem>
                          <SelectItem value="semi-detached" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Semi-detached</SelectItem>
                          <SelectItem value="terraced" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Terraced</SelectItem>
                          <SelectItem value="flat" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Flat</SelectItem>
                          <SelectItem value="commercial" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Commercial</SelectItem>
                          <SelectItem value="land" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Land</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-900 dark:text-gray-100">Bedrooms</FormLabel>
                      <FormControl>
                        <Input placeholder="3" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="yearBuilt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-900 dark:text-gray-100">Year Built</FormLabel>
                      <FormControl>
                        <Input placeholder="1995" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="epcRating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-900 dark:text-gray-100">EPC Rating</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger className="text-gray-900 dark:text-gray-100">
                            <SelectValue placeholder="Select rating" className="text-gray-900 dark:text-gray-100" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                          <SelectItem value="A" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">A</SelectItem>
                          <SelectItem value="B" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">B</SelectItem>
                          <SelectItem value="C" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">C</SelectItem>
                          <SelectItem value="D" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">D</SelectItem>
                          <SelectItem value="E" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">E</SelectItem>
                          <SelectItem value="F" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">F</SelectItem>
                          <SelectItem value="G" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">G</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Ownership Section */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Ownership Details</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ownershipType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-900 dark:text-gray-100">Ownership Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger className="text-gray-900 dark:text-gray-100">
                            <SelectValue placeholder="Select ownership" className="text-gray-900 dark:text-gray-100" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                          <SelectItem value="direct" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Direct</SelectItem>
                          <SelectItem value="spv" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">SPV</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sharePct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-900 dark:text-gray-100">Ownership Share (%)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="acquisitionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-900 dark:text-gray-100">Acquisition Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="acquisitionPriceGbp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-900 dark:text-gray-100">Purchase Price (£)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" placeholder="350000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={addPropertyMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addPropertyMutation.isPending}
                className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white"
              >
                {addPropertyMutation.isPending ? 'Adding...' : 'Add Property'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function PropertyPortfolio({ userId, className = '' }: PropertyPortfolioProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [propertyValuations, setPropertyValuations] = useState<Record<string, PropertyWithValuation>>({});
  const queryClient = useQueryClient();

  // Fetch properties for the user
  const { data: properties = [], isLoading, error } = useQuery<Property[]>({
    queryKey: ['/api/properties', userId],
    enabled: !!userId,
  });

  // Mutation for deleting properties
  const deletePropertyMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete property');
      }
      return propertyId;
    },
    onSuccess: (deletedPropertyId) => {
      // Invalidate and refetch properties
      queryClient.invalidateQueries({ queryKey: ['/api/properties', userId] });
      // Remove from local valuation state
      setPropertyValuations(prev => {
        const newState = { ...prev };
        delete newState[deletedPropertyId];
        return newState;
      });
    },
    onError: (error) => {
      console.error('Property deletion failed:', error);
    }
  });

  // Mutation for refreshing property valuations
  const refreshValuationMutation = useMutation({
    mutationFn: async (property: Property) => {
      if (!property.postcode) {
        throw new Error('Property postcode is required for valuation');
      }

      // First check for property price data
      const searchResponse = await fetch('/api/property-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: property.postcode, limit: 5 })
      }).then(res => res.json());

      // Get property valuation
      const valuationResponse = await fetch('/api/property-valuation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          postcode: property.postcode, 
          propertyType: property.propertyType?.toLowerCase() || 'detached',
          propertyId: property.id
        })
      }).then(res => res.json());

      return {
        propertyId: property.id,
        searchResults: searchResponse,
        valuation: valuationResponse.valuation
      };
    },
    onMutate: (property) => {
      // Optimistically update loading state
      setPropertyValuations(prev => ({
        ...prev,
        [property.id]: {
          ...property,
          isValuationLoading: true
        }
      }));
    },
    onSuccess: (data) => {
      const property = properties.find(p => p.id === data.propertyId);
      if (!property) return;

      // Find best comparable (same postcode area and property type if possible)
      const comparable = data.searchResults.find((result: any) => 
        result.postcode?.startsWith(property.postcode?.split(' ')[0] || '') &&
        result.type?.toLowerCase() === property.propertyType?.toLowerCase()
      ) || data.searchResults[0];

      setPropertyValuations(prev => ({
        ...prev,
        [data.propertyId]: {
          ...property,
          valuation: data.valuation,
          marketComparable: comparable,
          isValuationLoading: false
        }
      }));
    },
    onError: (error, property) => {
      console.error('Valuation refresh failed:', error);
      setPropertyValuations(prev => ({
        ...prev,
        [property.id]: {
          ...property,
          isValuationLoading: false
        }
      }));
    }
  });

  // Mutation for updating property acquisition price
  const updatePropertyPriceMutation = useMutation({
    mutationFn: async ({ propertyId, price, date }: { propertyId: string; price: number; date: string }) => {
      const response = await fetch(`/api/properties/${propertyId}/ownership-price`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          acquisitionPriceGbp: price.toString(),
          acquisitionDate: date
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update property price: ${response.status} ${errorText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Refresh the properties data to show updated prices
      queryClient.invalidateQueries({ queryKey: ['/api/properties', userId] });
      
      // Refresh the entire page to ensure all data is current
      setTimeout(() => {
        window.location.reload();
      }, 500);
    },
    onError: (error) => {
      console.error('Property price update failed:', error);
    }
  });

  // Merge properties with valuation data
  const propertiesWithValuations: PropertyWithValuation[] = properties.map(property => ({
    ...property,
    ...propertyValuations[property.id]
  }));

  // Utility functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatAddress = (property: Property) => {
    const parts = [
      property.addressLine1,
      property.addressLine2,
      property.city,
      property.postcode
    ].filter(Boolean);
    return parts.join(', ');
  };

  const getPropertyTypeIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'residential':
        return '🏠';
      case 'btl':
        return '🏘️';
      case 'commercial':
        return '🏢';
      case 'industrial':
        return '🏭';
      case 'land':
        return '🌳';
      case 'mixed':
        return '🏗️';
      default:
        return '🏠';
    }
  };

  const getEpcColor = (rating?: string) => {
    switch (rating?.toUpperCase()) {
      case 'A':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'B':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'C':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'D':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'E':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'F':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'G':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Property Portfolio</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Property Portfolio</h3>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-600 dark:text-red-400">
            Failed to load properties. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Property Portfolio</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'} in your portfolio
          </p>
        </div>
        <AddPropertyModal userId={userId} onSuccess={() => {}} />
      </div>

      {/* Property Summary Stats */}
      {properties.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-[var(--primary)]" />
                <div>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Total Properties</p>
                  <p className="text-xl font-semibold" style={{ color: 'var(--card-foreground)' }}>{properties.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <PoundSterling className="h-4 w-4" style={{ color: 'var(--success)' }} />
                <div>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Portfolio Value</p>
                  <p className="text-xl font-semibold" style={{ color: 'var(--card-foreground)' }}>
                    {(() => {
                      // Debug: Log property structure to understand data format
                      console.log('Portfolio Value Debug - Properties:', propertiesWithValuations.map(p => ({
                        id: p.id,
                        address: p.addressLine1,
                        latestValuation: p.latestValuation,
                        valuation: p.valuation
                      })));
                      
                      const totalValue = propertiesWithValuations
                        .filter(p => p.latestValuation?.estimatedValueGbp || p.valuation?.estimate)
                        .reduce((sum, p) => {
                          const value = p.latestValuation?.estimatedValueGbp || p.valuation?.estimate || 0;
                          console.log('Portfolio Value Debug - Property:', p.addressLine1, 'Value:', value);
                          return sum + value;
                        }, 0);
                      
                      console.log('Portfolio Value Debug - Total:', totalValue);
                      return totalValue > 0 ? formatCurrency(totalValue) : '—';
                    })()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[var(--secondary)]" />
                <div>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Unique Locations</p>
                  <p className="text-xl font-semibold" style={{ color: 'var(--card-foreground)' }}>
                    {new Set(properties.map(p => p.city).filter(Boolean)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[var(--accent)]" />
                <div>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Property Types</p>
                  <p className="text-xl font-semibold" style={{ color: 'var(--card-foreground)' }}>
                    {new Set(properties.map(p => p.propertyType).filter(Boolean)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" style={{ color: 'var(--success)' }} />
                <div>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Avg. EPC Rating</p>
                  <p className="text-xl font-semibold" style={{ color: 'var(--card-foreground)' }}>
                    {properties.filter(p => p.epcRating).length > 0 ? 'C' : '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Property Grid */}
      {properties.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Properties Yet
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start building your property portfolio by adding your first property.
            </p>
            <AddPropertyModal userId={userId} onSuccess={() => {}} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {propertiesWithValuations.map((property) => (
            <Card key={property.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md" style={{ 
              background: `linear-gradient(to bottom right, var(--card), var(--neutral-bg-alt))`,
              boxShadow: 'var(--shadow-md)'
            }}>
              <CardHeader className="pb-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-30" style={{
                  background: `linear-gradient(to bottom right, var(--primary), var(--secondary))`
                }}></div>
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg shadow-sm" style={{
                      background: `linear-gradient(to bottom right, var(--primary), var(--secondary))`,
                      color: 'var(--primary-foreground)'
                    }}>
                      <Home className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold transition-colors" style={{
                        color: 'var(--card-foreground)'
                      }}>
                        {property.addressLine1}
                      </CardTitle>
                      <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        <MapPin className="h-3 w-3" />
                        <span>{[property.city, property.postcode].filter(Boolean).join(', ')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {property.epcRating && (
                      <Badge className={`${getEpcColor(property.epcRating)} shadow-sm border-0`}>
                        EPC {property.epcRating}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-5">
                  {/* Property Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm rounded-lg p-4 border" style={{
                    backgroundColor: 'var(--muted)',
                    borderColor: 'var(--border)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    {property.propertyType && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                        <div>
                          <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>Type</span>
                          <p className="font-semibold capitalize" style={{ color: 'var(--card-foreground)' }}>
                            {property.propertyType}
                          </p>
                        </div>
                      </div>
                    )}
                    {property.bedrooms && (
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4" style={{ color: 'var(--success)' }} />
                        <div>
                          <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>Bedrooms</span>
                          <p className="font-semibold" style={{ color: 'var(--card-foreground)' }}>
                            {property.bedrooms}
                          </p>
                        </div>
                      </div>
                    )}
                    {property.floorAreaSqm && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" style={{ color: 'var(--info)' }} />
                        <div>
                          <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>Area</span>
                          <p className="font-semibold" style={{ color: 'var(--card-foreground)' }}>
                            {property.floorAreaSqm} m²
                          </p>
                        </div>
                      </div>
                    )}
                    {property.yearBuilt && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" style={{ color: 'var(--warning)' }} />
                        <div>
                          <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>Built</span>
                          <p className="font-semibold" style={{ color: 'var(--card-foreground)' }}>
                            {property.yearBuilt}
                          </p>
                        </div>
                      </div>
                    )}
                    {property.acquisitionPriceGbp && (
                      <div className="flex items-center gap-2">
                        <PoundSterling className="h-4 w-4" style={{ color: 'var(--success)' }} />
                        <div className="flex-1">
                          <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>Your Purchase</span>
                          <div className="flex items-center gap-2">
                            <p className="font-bold" style={{ color: 'var(--success)' }}>
                              {formatCurrency(Number(property.acquisitionPriceGbp))}
                            </p>
                            {property.latestPurchasePrice && 
                             Number(property.acquisitionPriceGbp) !== property.latestPurchasePrice.price && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <input
                                    type="checkbox"
                                    className="w-3 h-3 text-blue-600 rounded focus:ring-blue-500"
                                    disabled={updatePropertyPriceMutation.isPending}
                                    onChange={(e) => {
                                      if (e.target.checked && property.latestPurchasePrice) {
                                        // Update the property's acquisition price to match latest purchase price
                                        updatePropertyPriceMutation.mutate({
                                          propertyId: property.id,
                                          price: property.latestPurchasePrice.price,
                                          date: property.latestPurchasePrice.dateOfTransfer
                                        });
                                      }
                                    }}
                                    data-testid={`checkbox-align-price-${property.id}`}
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{updatePropertyPriceMutation.isPending ? 'Updating...' : `Update your purchase price to match official records (${formatCurrency(property.latestPurchasePrice.price)})`}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {property.acquisitionDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                        <div>
                          <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>Purchase Date</span>
                          <p className="font-semibold" style={{ color: 'var(--card-foreground)' }}>
                            {new Date(property.acquisitionDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Valuation Section */}
                  <div className="rounded-xl p-4 border" style={{
                    background: `linear-gradient(to right, var(--muted), var(--neutral-bg-alt))`,
                    borderColor: 'var(--border)',
                    borderRadius: 'var(--radius-lg)'
                  }}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--card-foreground)' }}>
                        <div className="p-1.5 rounded-lg" style={{
                          background: `linear-gradient(to bottom right, var(--primary), var(--secondary))`,
                          color: 'var(--primary-foreground)'
                        }}>
                          <BarChart3 className="h-4 w-4" />
                        </div>
                        Property Valuations
                      </h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => refreshValuationMutation.mutate(property)}
                        disabled={property.isValuationLoading || !property.postcode}
                        data-testid={`button-refresh-valuation-${property.id}`}
                        className="h-8 w-8 p-0"
                        style={{
                          borderColor: 'var(--border)',
                          color: 'var(--primary)'
                        }}
                      >
                        <RefreshCw className={`h-3 w-3 ${property.isValuationLoading ? 'animate-spin' : ''}`} style={{ color: 'var(--primary)' }} />
                      </Button>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {/* Latest Purchase Price from Records */}
                      {property.latestPurchasePrice ? (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <Home className="h-3 w-3" />
                            Latest Purchase:
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Most recent purchase price from official HM Land Registry records</p>
                              </TooltipContent>
                            </Tooltip>
                          </span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {formatCurrency(property.latestPurchasePrice.price)}
                          </span>
                        </div>
                      ) : property.acquisitionPriceGbp ? (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <Home className="h-3 w-3" />
                            Your Purchase:
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>The price you entered for this property</p>
                              </TooltipContent>
                            </Tooltip>
                          </span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {formatCurrency(Number(property.acquisitionPriceGbp))}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <Home className="h-3 w-3" />
                            Purchase Price:
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>No purchase price found in official records or user data</p>
                              </TooltipContent>
                            </Tooltip>
                          </span>
                          <span className="text-gray-500 dark:text-gray-500 italic">Not found</span>
                        </div>
                      )}

                      {/* Market Comparable */}
                      {(property.latestValuation?.comparableAvgValueGbp || property.marketComparable) ? (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Market Comp:
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Average value based on recent comparable property sales in your area</p>
                              </TooltipContent>
                            </Tooltip>
                          </span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {formatCurrency(property.latestValuation?.comparableAvgValueGbp || property.marketComparable?.price)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Market Comp:
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Average value based on recent comparable property sales in your area</p>
                              </TooltipContent>
                            </Tooltip>
                          </span>
                          <span className="text-gray-500 dark:text-gray-500 italic">
                            {property.isValuationLoading ? 'Loading...' : 'Not found'}
                          </span>
                        </div>
                      )}

                      {/* AI Valuation */}
                      {(property.latestValuation?.valueGbp || property.valuation) ? (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <BarChart3 className="h-3 w-3" />
                            AI Valuation:
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Smart estimate combining your purchase price with regional house price index growth</p>
                              </TooltipContent>
                            </Tooltip>
                          </span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(property.latestValuation?.valueGbp || property.valuation?.estimate)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <BarChart3 className="h-3 w-3" />
                            AI Valuation:
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Smart estimate combining your purchase price with regional house price index growth</p>
                              </TooltipContent>
                            </Tooltip>
                          </span>
                          <span className="text-gray-500 dark:text-gray-500 italic">
                            {property.isValuationLoading ? 'Loading...' : 'Click refresh'}
                          </span>
                        </div>
                      )}

                      {/* Regional Average */}
                      {(property.latestValuation?.hpiBaseValueGbp || property.valuation?.hpiBaseline) && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Area Average:
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Current average property price in {property.latestValuation?.regionName || 'your area'} based on official UK HPI data</p>
                              </TooltipContent>
                            </Tooltip>
                          </span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {formatCurrency(property.latestValuation?.hpiBaseValueGbp || property.valuation?.hpiBaseline)}
                          </span>
                        </div>
                      )}

                      {/* Valuation Range */}
                      {(property.latestValuation?.valuationRangeMinGbp && property.latestValuation?.valuationRangeMaxGbp) ? (
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-2 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            Range:
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Estimated value range considering market uncertainty and comparable sales variation</p>
                              </TooltipContent>
                            </Tooltip>
                          </span>
                          <span>
                            {formatCurrency(property.latestValuation.valuationRangeMinGbp)} - {formatCurrency(property.latestValuation.valuationRangeMaxGbp)}
                          </span>
                        </div>
                      ) : property.valuation?.range && (
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-2 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            Range:
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Estimated value range considering market uncertainty and comparable sales variation</p>
                              </TooltipContent>
                            </Tooltip>
                          </span>
                          <span>
                            {formatCurrency(property.valuation.range.min)} - {formatCurrency(property.valuation.range.max)}
                          </span>
                        </div>
                      )}
                      
                      {/* Purchase Date from Records */}
                      {property.latestPurchasePrice?.dateOfTransfer && (
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-2 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            Purchase Date:
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Date of the most recent property transfer from official HM Land Registry records</p>
                              </TooltipContent>
                            </Tooltip>
                          </span>
                          <span>
                            {new Date(property.latestPurchasePrice.dateOfTransfer).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {/* Valuation Date */}
                      {property.latestValuation?.createdAt && (
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-2 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            Valuation Updated:
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>When this valuation was last calculated and saved to the database</p>
                              </TooltipContent>
                            </Tooltip>
                          </span>
                          <span>
                            {new Date(property.latestValuation.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-3 flex-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            data-testid={`button-view-property-${property.id}`}
                            onClick={() => setSelectedProperty(property)}
                            className="flex-1 transition-colors hover:opacity-90"
                            style={{
                              backgroundColor: 'var(--card)',
                              borderColor: 'var(--border)',
                              color: 'var(--primary)'
                            }}
                          >
                            <Eye className="h-3 w-3 mr-2" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle className="text-gray-900 dark:text-gray-100">
                              Property Details
                            </DialogTitle>
                            <DialogDescription className="text-gray-600 dark:text-gray-400">
                              {formatAddress(selectedProperty || property)}
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedProperty && (
                            <div className="space-y-6">
                              {/* Address Section */}
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Address</h4>
                                <div className="space-y-1 text-sm">
                                  <p>{selectedProperty.addressLine1}</p>
                                  {selectedProperty.addressLine2 && <p>{selectedProperty.addressLine2}</p>}
                                  <p>{[selectedProperty.city, selectedProperty.postcode].filter(Boolean).join(', ')}</p>
                                  <p>{selectedProperty.country}</p>
                                </div>
                              </div>

                              {/* Property Details */}
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Property Information</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  {selectedProperty.uprn && (
                                    <div>
                                      <span className="text-gray-600 dark:text-gray-400">UPRN:</span>
                                      <p className="font-medium">{selectedProperty.uprn}</p>
                                    </div>
                                  )}
                                  {selectedProperty.titleNumber && (
                                    <div>
                                      <span className="text-gray-600 dark:text-gray-400">Title Number:</span>
                                      <p className="font-medium">{selectedProperty.titleNumber}</p>
                                    </div>
                                  )}
                                  {selectedProperty.propertyType && (
                                    <div>
                                      <span className="text-gray-600 dark:text-gray-400">Type:</span>
                                      <p className="font-medium capitalize">{selectedProperty.propertyType}</p>
                                    </div>
                                  )}
                                  {selectedProperty.bedrooms && (
                                    <div>
                                      <span className="text-gray-600 dark:text-gray-400">Bedrooms:</span>
                                      <p className="font-medium">{selectedProperty.bedrooms}</p>
                                    </div>
                                  )}
                                  {selectedProperty.floorAreaSqm && (
                                    <div>
                                      <span className="text-gray-600 dark:text-gray-400">Floor Area:</span>
                                      <p className="font-medium">{selectedProperty.floorAreaSqm} m²</p>
                                    </div>
                                  )}
                                  {selectedProperty.yearBuilt && (
                                    <div>
                                      <span className="text-gray-600 dark:text-gray-400">Year Built:</span>
                                      <p className="font-medium">{selectedProperty.yearBuilt}</p>
                                    </div>
                                  )}
                                  {selectedProperty.epcRating && (
                                    <div>
                                      <span className="text-gray-600 dark:text-gray-400">EPC Rating:</span>
                                      <Badge className={getEpcColor(selectedProperty.epcRating)}>
                                        {selectedProperty.epcRating}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Meta Information */}
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Record Information</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-400">Added:</span>
                                    <p className="font-medium">
                                      {new Date(selectedProperty.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-400">Updated:</span>
                                    <p className="font-medium">
                                      {new Date(selectedProperty.updatedAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        data-testid={`button-edit-property-${property.id}`}
                        className="flex-1 transition-colors hover:opacity-90"
                        style={{
                          backgroundColor: 'var(--card)',
                          borderColor: 'var(--border)',
                          color: 'var(--card-foreground)'
                        }}
                      >
                        <Edit className="h-3 w-3 mr-2" />
                        Edit
                      </Button>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="px-3 transition-colors hover:opacity-90"
                      style={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                        color: 'var(--destructive)'
                      }}
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
                          deletePropertyMutation.mutate(property.id);
                        }
                      }}
                      disabled={deletePropertyMutation.isPending}
                      data-testid={`button-delete-property-${property.id}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </TooltipProvider>
  );
}