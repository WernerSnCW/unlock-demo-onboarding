import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Coins, TrendingUp, Plus, Eye, Edit, Trash2, Calendar, DollarSign, Target, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface AlternativeInvestment {
  id: string;
  userId: string;
  investmentType: string;
  name: string;
  description: string | null;
  investmentDateUk: string | null;
  maturityDateUk: string | null;
  investmentAmountGbp: string;
  currentValueGbp: string;
  targetReturnPct: string | null;
  riskRating: string;
  taxWrapperEligible: string | null;
  createdAt: string;
  updatedAt: string;
}

// Form schema for adding new alternative investment
const addAlternativeInvestmentSchema = z.object({
  investmentType: z.string().min(1, 'Investment type is required'),
  name: z.string().min(1, 'Investment name is required'),
  description: z.string().optional(),
  investmentDateUk: z.string().optional(),
  maturityDateUk: z.string().optional(),
  investmentAmountGbp: z.string().min(1, 'Investment amount is required'),
  currentValueGbp: z.string().min(1, 'Current value is required'),
  targetReturnPct: z.string().optional(),
  riskRating: z.enum(['low', 'medium', 'high']).default('medium'),
  taxWrapperEligible: z.string().optional()
});

type AlternativeInvestmentFormData = z.infer<typeof addAlternativeInvestmentSchema>;

interface AlternativeInvestmentsProps {
  userId: string;
}

const formatCurrency = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

const formatPercentage = (percent: string | number | null) => {
  if (!percent) return 'N/A';
  const num = typeof percent === 'string' ? parseFloat(percent) : percent;
  return `${num.toFixed(1)}%`;
};

const getInvestmentTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'private_equity':
    case 'venture_capital':
      return <TrendingUp className="h-4 w-4" />;
    case 'cryptocurrency':
      return <Coins className="h-4 w-4" />;
    case 'art':
    case 'collectibles':
      return <Award className="h-4 w-4" />;
    default:
      return <DollarSign className="h-4 w-4" />;
  }
};

const getRiskColor = (risk: string) => {
  switch (risk.toLowerCase()) {
    case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

export function AlternativeInvestments({ userId }: AlternativeInvestmentsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<AlternativeInvestment | null>(null);

  // Fetch alternative investments
  const { data: investments = [], isLoading } = useQuery<AlternativeInvestment[]>({
    queryKey: ['/api/alternatives', userId],
    enabled: !!userId,
  });

  // Form for adding new investment
  const form = useForm<AlternativeInvestmentFormData>({
    resolver: zodResolver(addAlternativeInvestmentSchema),
    defaultValues: {
      investmentType: '',
      name: '',
      description: '',
      investmentAmountGbp: '',
      currentValueGbp: '',
      riskRating: 'medium'
    },
  });

  // Add investment mutation
  const addInvestmentMutation = useMutation({
    mutationFn: async (data: AlternativeInvestmentFormData) => {
      return await apiRequest('/api/alternatives', 'POST', {
        ...data,
        userId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alternatives', userId] });
      setIsAddDialogOpen(false);
      form.reset();
    },
  });

  // Delete investment mutation
  const deleteInvestmentMutation = useMutation({
    mutationFn: async (investmentId: string) => {
      return await apiRequest(`/api/alternatives/${investmentId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alternatives', userId] });
    },
  });

  const onSubmit = (data: AlternativeInvestmentFormData) => {
    addInvestmentMutation.mutate(data);
  };

  const calculateReturn = (invested: string, current: string) => {
    const investedNum = parseFloat(invested);
    const currentNum = parseFloat(current);
    if (investedNum === 0) return 0;
    return ((currentNum - investedNum) / investedNum) * 100;
  };

  const totalInvested = investments.reduce((sum: number, inv: AlternativeInvestment) => 
    sum + parseFloat(inv.investmentAmountGbp), 0);
  const totalCurrentValue = investments.reduce((sum: number, inv: AlternativeInvestment) => 
    sum + parseFloat(inv.currentValueGbp), 0);
  const totalReturn = totalInvested > 0 ? ((totalCurrentValue - totalInvested) / totalInvested) * 100 : 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: 'var(--card-foreground)' }}>
            <Coins className="h-5 w-5" style={{ color: 'var(--primary)' }} />
            Alternative Investments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2" style={{ color: 'var(--card-foreground)' }}>
            <Coins className="h-5 w-5" style={{ color: 'var(--primary)' }} />
            Alternative Investments
          </h3>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Private equity, venture capital, crypto, art, and other alternative investments
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Investment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle style={{ color: 'var(--card-foreground)' }}>Add Alternative Investment</DialogTitle>
              <DialogDescription style={{ color: 'var(--muted-foreground)' }}>
                Add details about your alternative investment
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="investmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: 'var(--card-foreground)' }}>Investment Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select investment type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="private_equity">Private Equity</SelectItem>
                          <SelectItem value="venture_capital">Venture Capital</SelectItem>
                          <SelectItem value="hedge_fund">Hedge Fund</SelectItem>
                          <SelectItem value="real_estate_fund">Real Estate Fund</SelectItem>
                          <SelectItem value="cryptocurrency">Cryptocurrency</SelectItem>
                          <SelectItem value="art">Art</SelectItem>
                          <SelectItem value="collectibles">Collectibles</SelectItem>
                          <SelectItem value="commodities">Commodities</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: 'var(--card-foreground)' }}>Investment Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Venture Fund II, Bitcoin, Art Collection" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: 'var(--card-foreground)' }}>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Brief description of the investment" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="investmentAmountGbp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: 'var(--card-foreground)' }}>Investment Amount (£)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="50000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currentValueGbp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: 'var(--card-foreground)' }}>Current Value (£)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="65000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="targetReturnPct"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: 'var(--card-foreground)' }}>Target Return (%)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="15" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="riskRating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: 'var(--card-foreground)' }}>Risk Rating</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={addInvestmentMutation.isPending}
                    style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                  >
                    {addInvestmentMutation.isPending ? 'Adding...' : 'Add Investment'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      {investments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>Total Invested</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--card-foreground)' }}>
                    {formatCurrency(totalInvested)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8" style={{ color: 'var(--muted-foreground)' }} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>Current Value</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--card-foreground)' }}>
                    {formatCurrency(totalCurrentValue)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8" style={{ color: 'var(--muted-foreground)' }} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>Total Return</p>
                  <p className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatPercentage(totalReturn)}
                  </p>
                </div>
                <Target className="h-8 w-8" style={{ color: 'var(--muted-foreground)' }} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Investments List */}
      {investments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Coins className="mx-auto h-12 w-12 mb-4" style={{ color: 'var(--muted-foreground)' }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--card-foreground)' }}>
              No Alternative Investments
            </h3>
            <p className="mb-4" style={{ color: 'var(--muted-foreground)' }}>
              Add your alternative investments to track performance and get insights
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {investments.map((investment: AlternativeInvestment) => {
            const returnPct = calculateReturn(investment.investmentAmountGbp, investment.currentValueGbp);
            const isPositive = returnPct >= 0;

            return (
              <Card key={investment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getInvestmentTypeIcon(investment.investmentType)}
                      <h4 className="font-medium truncate" style={{ color: 'var(--card-foreground)' }}>
                        {investment.name}
                      </h4>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedInvestment(investment)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteInvestmentMutation.mutate(investment.id)}
                        className="h-8 w-8 p-0"
                        disabled={deleteInvestmentMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--muted-foreground)' }}>Invested:</span>
                      <span style={{ color: 'var(--card-foreground)' }}>
                        {formatCurrency(investment.investmentAmountGbp)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--muted-foreground)' }}>Current:</span>
                      <span style={{ color: 'var(--card-foreground)' }}>
                        {formatCurrency(investment.currentValueGbp)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--muted-foreground)' }}>Return:</span>
                      <span className={isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {formatPercentage(returnPct)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                    <Badge className={getRiskColor(investment.riskRating)}>
                      {investment.riskRating} risk
                    </Badge>
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      {investment.investmentType.replace('_', ' ')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Investment Details Dialog */}
      <Dialog open={!!selectedInvestment} onOpenChange={() => setSelectedInvestment(null)}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedInvestment && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2" style={{ color: 'var(--card-foreground)' }}>
                  {getInvestmentTypeIcon(selectedInvestment.investmentType)}
                  {selectedInvestment.name}
                </DialogTitle>
                <DialogDescription style={{ color: 'var(--muted-foreground)' }}>
                  {selectedInvestment.investmentType.replace('_', ' ')} investment details
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {selectedInvestment.description && (
                  <div>
                    <h4 className="font-medium mb-2" style={{ color: 'var(--card-foreground)' }}>Description</h4>
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      {selectedInvestment.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span style={{ color: 'var(--muted-foreground)' }}>Investment Amount:</span>
                    <p className="font-medium" style={{ color: 'var(--card-foreground)' }}>
                      {formatCurrency(selectedInvestment.investmentAmountGbp)}
                    </p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted-foreground)' }}>Current Value:</span>
                    <p className="font-medium" style={{ color: 'var(--card-foreground)' }}>
                      {formatCurrency(selectedInvestment.currentValueGbp)}
                    </p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted-foreground)' }}>Target Return:</span>
                    <p className="font-medium" style={{ color: 'var(--card-foreground)' }}>
                      {formatPercentage(selectedInvestment.targetReturnPct)}
                    </p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted-foreground)' }}>Risk Rating:</span>
                    <Badge className={getRiskColor(selectedInvestment.riskRating)}>
                      {selectedInvestment.riskRating} risk
                    </Badge>
                  </div>
                  {selectedInvestment.investmentDateUk && (
                    <div>
                      <span style={{ color: 'var(--muted-foreground)' }}>Investment Date:</span>
                      <p className="font-medium" style={{ color: 'var(--card-foreground)' }}>
                        {selectedInvestment.investmentDateUk}
                      </p>
                    </div>
                  )}
                  {selectedInvestment.maturityDateUk && (
                    <div>
                      <span style={{ color: 'var(--muted-foreground)' }}>Maturity Date:</span>
                      <p className="font-medium" style={{ color: 'var(--card-foreground)' }}>
                        {selectedInvestment.maturityDateUk}
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                  <h4 className="font-medium mb-2" style={{ color: 'var(--card-foreground)' }}>Performance</h4>
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--muted-foreground)' }}>Total Return:</span>
                      <span className={calculateReturn(selectedInvestment.investmentAmountGbp, selectedInvestment.currentValueGbp) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {formatPercentage(calculateReturn(selectedInvestment.investmentAmountGbp, selectedInvestment.currentValueGbp))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}