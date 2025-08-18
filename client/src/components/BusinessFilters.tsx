import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FilterState {
  sectors: string[];
  sizes: string[];
  risk: string;
  eligibility: {
    EIS: boolean;
    SEIS: boolean;
  };
}

interface BusinessFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const SECTORS = [
  'Biotechnology',
  'Fintech',
  'Sustainable Materials',
  'CleanTech',
  'HealthTech',
  'DeepTech',
  'EdTech',
  'PropTech',
  'FoodTech',
  'Cybersecurity'
];

const SIZES = [
  'Micro (1-9)',
  'Small (10-49)',
  'Medium (50-249)',
  'Large (250+)'
];

const RISKS = ['Any', 'Low', 'Medium', 'High'];

export default function BusinessFilters({ filters, onFiltersChange }: BusinessFiltersProps) {
  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const handleSectorChange = (sector: string, checked: boolean) => {
    const newSectors = checked
      ? [...filters.sectors, sector]
      : filters.sectors.filter(s => s !== sector);
    updateFilters({ sectors: newSectors });
  };

  const handleSizeChange = (size: string, checked: boolean) => {
    const newSizes = checked
      ? [...filters.sizes, size]
      : filters.sizes.filter(s => s !== size);
    updateFilters({ sizes: newSizes });
  };

  const handleEligibilityChange = (type: 'EIS' | 'SEIS', checked: boolean) => {
    updateFilters({
      eligibility: {
        ...filters.eligibility,
        [type]: checked
      }
    });
  };

  const resetFilters = () => {
    onFiltersChange({
      sectors: [],
      sizes: [],
      risk: 'Any',
      eligibility: { EIS: false, SEIS: false }
    });
  };

  const hasActiveFilters = filters.sectors.length > 0 || 
                          filters.sizes.length > 0 || 
                          filters.risk !== 'Any' || 
                          filters.eligibility.EIS || 
                          filters.eligibility.SEIS;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-[#5193B3] hover:text-[#4082a2] hover:bg-[#5193B3]/10"
          >
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Sectors */}
        <div>
          <Label className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 block">
            Sector
          </Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {SECTORS.map((sector) => (
              <div key={sector} className="flex items-center space-x-2">
                <Checkbox
                  id={`sector-${sector}`}
                  checked={filters.sectors.includes(sector)}
                  onCheckedChange={(checked) => handleSectorChange(sector, !!checked)}
                />
                <Label
                  htmlFor={`sector-${sector}`}
                  className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  {sector}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Size */}
        <div>
          <Label className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 block">
            Size
          </Label>
          <div className="space-y-2">
            {SIZES.map((size) => (
              <div key={size} className="flex items-center space-x-2">
                <Checkbox
                  id={`size-${size}`}
                  checked={filters.sizes.includes(size)}
                  onCheckedChange={(checked) => handleSizeChange(size, !!checked)}
                />
                <Label
                  htmlFor={`size-${size}`}
                  className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  {size}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Profile */}
        <div>
          <Label className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 block">
            Risk Profile
          </Label>
          <Select
            value={filters.risk}
            onValueChange={(value) => updateFilters({ risk: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RISKS.map((risk) => (
                <SelectItem key={risk} value={risk}>
                  {risk}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Eligibility */}
        <div>
          <Label className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 block">
            Tax Relief Eligibility
          </Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="eligibility-eis"
                checked={filters.eligibility.EIS}
                onCheckedChange={(checked) => handleEligibilityChange('EIS', !!checked)}
              />
              <Label
                htmlFor="eligibility-eis"
                className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                EIS Eligible
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="eligibility-seis"
                checked={filters.eligibility.SEIS}
                onCheckedChange={(checked) => handleEligibilityChange('SEIS', !!checked)}
              />
              <Label
                htmlFor="eligibility-seis"
                className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                SEIS Eligible
              </Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}