import { useState } from 'react';
import { Upload, FileText, Check, X, AlertCircle, Download } from 'lucide-react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { FileDrop } from '@/components/shared/FileDrop';
import { usePortfolioStoreDB, Position } from '@/state/portfolioStoreDB';
import { formatGBP } from '@/utils/formatters';

interface ColumnMapping {
  [key: string]: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ParsedRow {
  raw: Record<string, any>;
  mapped: Partial<Position>;
  errors: ValidationError[];
}

interface PortfolioUploaderProps {
  onUploadComplete?: () => void;
  className?: string;
}

export function PortfolioUploader({ onUploadComplete, className = '' }: PortfolioUploaderProps) {
  const { positions, addPosition } = usePortfolioStoreDB();
  
  const [uploadStep, setUploadStep] = useState<'drop' | 'mapping' | 'validation' | 'complete'>('drop');
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [mappedData, setMappedData] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const requiredFields = [
    { key: 'ticker', label: 'Ticker', required: true },
    { key: 'name', label: 'Company Name', required: false },
    { key: 'quantity', label: 'Quantity', required: true },
    { key: 'avgCost', label: 'Average Cost', required: true },
    { key: 'market', label: 'Market', required: false },
    { key: 'currency', label: 'Currency', required: false },
    { key: 'sector', label: 'Sector', required: false },
    { key: 'country', label: 'Country', required: false },
  ];

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    
    // Use papaparse for robust CSV parsing
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      transform: (value: string) => value.trim(),
      complete: (results) => {
        try {
          if (results.errors.length > 0) {
            console.warn('CSV parsing warnings:', results.errors);
          }
          
          if (results.data.length === 0) {
            throw new Error('File contains no data rows');
          }

          const headers = results.meta.fields || [];
          const data = results.data.map((row: any, index: number) => ({
            ...row,
            _rowIndex: index + 2, // +2 because we're 0-indexed and skipped header
          }));

          setDetectedHeaders(headers);
          setParsedData(data);
          
          // Auto-map columns based on common patterns
          const autoMapping: ColumnMapping = {};
          headers.forEach(header => {
            const lowerHeader = header.toLowerCase();
            if (lowerHeader.includes('ticker') || lowerHeader.includes('symbol')) {
              autoMapping.ticker = header;
            } else if (lowerHeader.includes('name') || lowerHeader.includes('company')) {
              autoMapping.name = header;
            } else if (lowerHeader.includes('quantity') || lowerHeader.includes('shares')) {
              autoMapping.quantity = header;
            } else if (lowerHeader.includes('cost') || lowerHeader.includes('price')) {
              autoMapping.avgCost = header;
            } else if (lowerHeader.includes('market') || lowerHeader.includes('exchange')) {
              autoMapping.market = header;
            } else if (lowerHeader.includes('currency')) {
              autoMapping.currency = header;
            } else if (lowerHeader.includes('sector') || lowerHeader.includes('industry')) {
              autoMapping.sector = header;
            } else if (lowerHeader.includes('country') || lowerHeader.includes('region')) {
              autoMapping.country = header;
            }
          });
          
          setColumnMapping(autoMapping);
          setUploadStep('mapping');
        } catch (error) {
          console.error('Error processing CSV data:', error);
          alert(`Error processing CSV data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
          setIsProcessing(false);
        }
      },
      error: (error) => {
        console.error('Error parsing file:', error);
        alert(`Error parsing file: ${error.message || 'Unknown error'}`);
        setIsProcessing(false);
      }
    });
  };

  const handleMapping = () => {
    setIsProcessing(true);
    
    try {
      const mappedRows: ParsedRow[] = parsedData.map((row, index) => {
        const mapped: Partial<Position> = {};
        const errors: ValidationError[] = [];

        // Map columns
        Object.entries(columnMapping).forEach(([field, header]) => {
          if (header && row[header] !== undefined) {
            let value = row[header];
            
            // Type conversions and validation
            switch (field) {
              case 'quantity':
              case 'avgCost':
                const numValue = parseFloat(value);
                if (isNaN(numValue) || numValue < 0) {
                  errors.push({
                    row: index + 1,
                    field,
                    message: `${field} must be a valid number >= 0`
                  });
                } else {
                  (mapped as any)[field] = numValue;
                }
                break;
              case 'ticker':
                if (!value || value.toString().trim() === '') {
                  errors.push({
                    row: index + 1,
                    field,
                    message: 'Ticker cannot be empty'
                  });
                } else {
                  (mapped as any)[field] = value.toString().trim().toUpperCase();
                }
                break;
              default:
                (mapped as any)[field] = value.toString().trim();
            }
          }
        });

        // Set defaults
        if (!mapped.name) mapped.name = mapped.ticker || 'Unknown';
        if (!mapped.market) mapped.market = 'Unknown';
        if (!mapped.currency) {
          // Infer currency from market
          if (mapped.market?.includes('LSE') || mapped.market?.includes('L')) {
            mapped.currency = 'GBP';
          } else {
            mapped.currency = 'USD';
          }
        }
        if (!mapped.sector) mapped.sector = 'Other';
        if (!mapped.country) {
          mapped.country = mapped.currency === 'GBP' ? 'UK' : 'US';
        }
        if (!mapped.price) mapped.price = mapped.avgCost || 0;
        if (!mapped.asOf) mapped.asOf = new Date().toISOString().split('T')[0];

        // Required field validation
        if (!mapped.ticker) {
          errors.push({ row: index + 1, field: 'ticker', message: 'Ticker is required' });
        }
        if (mapped.quantity === undefined) {
          errors.push({ row: index + 1, field: 'quantity', message: 'Quantity is required' });
        }
        if (mapped.avgCost === undefined) {
          errors.push({ row: index + 1, field: 'avgCost', message: 'Average cost is required' });
        }

        return {
          raw: row,
          mapped,
          errors
        };
      });

      setMappedData(mappedRows);
      setUploadStep('validation');
    } catch (error) {
      console.error('Error mapping data:', error);
      alert('Error mapping data. Please check your column mappings.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    setIsProcessing(true);
    
    try {
      const validRows = mappedData.filter(row => row.errors.length === 0);
      const newPositions: Omit<Position, 'id'>[] = validRows.map((row) => ({
        ticker: row.mapped.ticker!,
        name: row.mapped.name!,
        market: row.mapped.market!,
        currency: row.mapped.currency!,
        quantity: row.mapped.quantity!,
        avgCost: row.mapped.avgCost!,
        price: row.mapped.price!,
        sector: row.mapped.sector!,
        country: row.mapped.country!,
        asOf: row.mapped.asOf!,
        meta: row.raw
      }));

      // Add each position to the database
      for (const position of newPositions) {
        await addPosition(position);
      }
      
      setUploadStep('complete');
      onUploadComplete?.();
    } catch (error) {
      console.error('Error importing data:', error);
      alert('Error importing data. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetUpload = () => {
    setUploadStep('drop');
    setParsedData([]);
    setDetectedHeaders([]);
    setColumnMapping({});
    setMappedData([]);
  };

  const downloadTemplate = () => {
    const csvContent = `Ticker,Name,Market,Currency,Quantity,Average Cost,Purchase Date,ISIN,Notes
NVDA,NVIDIA Corp.,NASDAQ,USD,120,612.5,2024-03-01,US67066G1040,Long-term AI bet
BARC.L,Barclays PLC,LSE,GBP,4500,1.48,2023-11-10,GB0031348658,Dividend reinvest
AAPL,Apple Inc.,NASDAQ,USD,50,180.25,2024-01-15,US0378331005,Core holding
MSFT,Microsoft Corporation,NASDAQ,USD,25,400.00,2024-02-20,US5949181045,Cloud play`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'portfolio_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {uploadStep === 'drop' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Upload Portfolio
            </h3>
            <Button variant="outline" onClick={downloadTemplate} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>
          
          <FileDrop
            onFileSelect={handleFileSelect}
            acceptedTypes={['.csv', '.xlsx']}
            disabled={isProcessing}
          />
          
          {isProcessing && (
            <div className="text-center py-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Processing file...
              </div>
            </div>
          )}
        </div>
      )}

      {uploadStep === 'mapping' && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Map Columns
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Match your CSV columns to the required portfolio fields. Fields marked with * are required.
          </p>
          
          <div className="space-y-4">
            {requiredFields.map(field => (
              <div key={field.key} className="grid grid-cols-2 gap-4 items-center">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </div>
                <select
                  value={columnMapping[field.key] || ''}
                  onChange={(e) => setColumnMapping(prev => ({
                    ...prev,
                    [field.key]: e.target.value
                  }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select column...</option>
                  {detectedHeaders.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={resetUpload}>
              Cancel
            </Button>
            <Button 
              onClick={handleMapping}
              disabled={!columnMapping.ticker || !columnMapping.quantity || !columnMapping.avgCost}
            >
              Continue to Validation
            </Button>
          </div>
        </div>
      )}

      {uploadStep === 'validation' && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Validation Results
          </h3>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {mappedData.filter(row => row.errors.length === 0).length} valid rows, 
                  {mappedData.filter(row => row.errors.length > 0).length} errors
                </span>
              </div>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {mappedData.map((row, index) => (
                <div key={index} className={`px-4 py-3 border-b border-gray-100 dark:border-gray-800 ${
                  row.errors.length > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'
                }`}>
                  <div className="flex items-center gap-2">
                    {row.errors.length === 0 ? (
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                    <span className="text-sm font-medium">
                      Row {index + 1}: {row.mapped.ticker || 'Unknown'}
                    </span>
                  </div>
                  
                  {row.errors.length > 0 && (
                    <div className="mt-1 ml-6">
                      {row.errors.map((error, errorIndex) => (
                        <div key={errorIndex} className="text-xs text-red-700 dark:text-red-300">
                          {error.field}: {error.message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={() => setUploadStep('mapping')}>
              Back to Mapping
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetUpload}>
                Cancel
              </Button>
              <Button 
                onClick={handleImport}
                disabled={mappedData.filter(row => row.errors.length === 0).length === 0}
              >
                Import {mappedData.filter(row => row.errors.length === 0).length} Valid Rows
              </Button>
            </div>
          </div>
        </div>
      )}

      {uploadStep === 'complete' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Portfolio Uploaded Successfully
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your portfolio positions have been imported and are now available in your portfolio view.
          </p>
          <Button onClick={resetUpload}>
            Upload Another File
          </Button>
        </div>
      )}
    </div>
  );
}