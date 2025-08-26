import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import { db } from '../server/db';
import { ukHpi } from '../shared/schema';

interface HpiRow {
  Date: string;
  RegionName: string;
  AreaCode: string;
  AveragePrice: string;
  Index: string;
  IndexSA: string;
  '1m%Change': string;
  '12m%Change': string;
  AveragePriceSA: string;
  SalesVolume: string;
  DetachedPrice: string;
  DetachedIndex: string;
  'Detached1m%Change': string;
  'Detached12m%Change': string;
  SemiDetachedPrice: string;
  SemiDetachedIndex: string;
  'SemiDetached1m%Change': string;
  'SemiDetached12m%Change': string;
  TerracedPrice: string;
  TerracedIndex: string;
  'Terraced1m%Change': string;
  'Terraced12m%Change': string;
  FlatPrice: string;
  FlatIndex: string;
  'Flat1m%Change': string;
  'Flat12m%Change': string;
  CashPrice: string;
  CashIndex: string;
  'Cash1m%Change': string;
  'Cash12m%Change': string;
  CashSalesVolume: string;
  MortgagePrice: string;
  MortgageIndex: string;
  'Mortgage1m%Change': string;
  'Mortgage12m%Change': string;
  MortgageSalesVolume: string;
  FTBPrice: string;
  FTBIndex: string;
  'FTB1m%Change': string;
  'FTB12m%Change': string;
  FOOPrice: string;
  FOOIndex: string;
  'FOO1m%Change': string;
  'FOO12m%Change': string;
  NewPrice: string;
  NewIndex: string;
  'New1m%Change': string;
  'New12m%Change': string;
  NewSalesVolume: string;
  OldPrice: string;
  OldIndex: string;
  'Old1m%Change': string;
  'Old12m%Change': string;
  OldSalesVolume: string;
}

function parseNumeric(value: string): string | null {
  if (!value || value === '' || value === '..') return null;
  return value;
}

function parseInteger(value: string): number | null {
  if (!value || value === '' || value === '..') return null;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
}

async function importUkHpiData() {
  console.log('Starting UK HPI data import...');
  
  const records: any[] = [];
  let processedCount = 0;
  const batchSize = 1000;

  // Check if data already exists
  const existingCount = await db.select().from(ukHpi).then(rows => rows.length);
  if (existingCount > 0) {
    console.log(`Found ${existingCount} existing records. Skipping import.`);
    return;
  }

  return new Promise<void>((resolve, reject) => {
    createReadStream('attached_assets/UK-HPI-full-file-2025-06_1756218355995.csv')
      .pipe(parse({ 
        delimiter: ',',
        columns: true,
        skip_empty_lines: true 
      }))
      .on('data', (row: HpiRow) => {
        try {
          const record = {
            date: row.Date,
            regionName: row.RegionName,
            areaCode: row.AreaCode,
            averagePrice: parseNumeric(row.AveragePrice),
            index: parseNumeric(row.Index),
            indexSa: parseNumeric(row.IndexSA),
            monthlyChangePercent: parseNumeric(row['1m%Change']),
            yearlyChangePercent: parseNumeric(row['12m%Change']),
            averagePriceSa: parseNumeric(row.AveragePriceSA),
            salesVolume: parseInteger(row.SalesVolume),
            detachedPrice: parseNumeric(row.DetachedPrice),
            detachedIndex: parseNumeric(row.DetachedIndex),
            detachedMonthlyChange: parseNumeric(row['Detached1m%Change']),
            detachedYearlyChange: parseNumeric(row['Detached12m%Change']),
            semiDetachedPrice: parseNumeric(row.SemiDetachedPrice),
            semiDetachedIndex: parseNumeric(row.SemiDetachedIndex),
            semiDetachedMonthlyChange: parseNumeric(row['SemiDetached1m%Change']),
            semiDetachedYearlyChange: parseNumeric(row['SemiDetached12m%Change']),
            terracedPrice: parseNumeric(row.TerracedPrice),
            terracedIndex: parseNumeric(row.TerracedIndex),
            terracedMonthlyChange: parseNumeric(row['Terraced1m%Change']),
            terracedYearlyChange: parseNumeric(row['Terraced12m%Change']),
            flatPrice: parseNumeric(row.FlatPrice),
            flatIndex: parseNumeric(row.FlatIndex),
            flatMonthlyChange: parseNumeric(row['Flat1m%Change']),
            flatYearlyChange: parseNumeric(row['Flat12m%Change']),
            cashPrice: parseNumeric(row.CashPrice),
            cashIndex: parseNumeric(row.CashIndex),
            cashMonthlyChange: parseNumeric(row['Cash1m%Change']),
            cashYearlyChange: parseNumeric(row['Cash12m%Change']),
            cashSalesVolume: parseInteger(row.CashSalesVolume),
            mortgagePrice: parseNumeric(row.MortgagePrice),
            mortgageIndex: parseNumeric(row.MortgageIndex),
            mortgageMonthlyChange: parseNumeric(row['Mortgage1m%Change']),
            mortgageYearlyChange: parseNumeric(row['Mortgage12m%Change']),
            mortgageSalesVolume: parseInteger(row.MortgageSalesVolume),
            ftbPrice: parseNumeric(row.FTBPrice),
            ftbIndex: parseNumeric(row.FTBIndex),
            ftbMonthlyChange: parseNumeric(row['FTB1m%Change']),
            ftbYearlyChange: parseNumeric(row['FTB12m%Change']),
            fooPrice: parseNumeric(row.FOOPrice),
            fooIndex: parseNumeric(row.FOOIndex),
            fooMonthlyChange: parseNumeric(row['FOO1m%Change']),
            fooYearlyChange: parseNumeric(row['FOO12m%Change']),
            newPrice: parseNumeric(row.NewPrice),
            newIndex: parseNumeric(row.NewIndex),
            newMonthlyChange: parseNumeric(row['New1m%Change']),
            newYearlyChange: parseNumeric(row['New12m%Change']),
            newSalesVolume: parseInteger(row.NewSalesVolume),
            oldPrice: parseNumeric(row.OldPrice),
            oldIndex: parseNumeric(row.OldIndex),
            oldMonthlyChange: parseNumeric(row['Old1m%Change']),
            oldYearlyChange: parseNumeric(row['Old12m%Change']),
            oldSalesVolume: parseInteger(row.OldSalesVolume),
          };

          records.push(record);
          processedCount++;

          // Insert in batches to avoid memory issues
          if (records.length >= batchSize) {
            insertBatch([...records])
              .then(() => {
                console.log(`Inserted batch of ${records.length} records. Total processed: ${processedCount}`);
              })
              .catch(console.error);
            records.length = 0; // Clear array
          }
        } catch (error) {
          console.error('Error processing row:', error, row);
        }
      })
      .on('end', async () => {
        try {
          // Insert remaining records
          if (records.length > 0) {
            await insertBatch(records);
            console.log(`Inserted final batch of ${records.length} records.`);
          }
          console.log(`UK HPI data import completed. Total records processed: ${processedCount}`);
          resolve();
        } catch (error) {
          console.error('Error in final batch:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV file:', error);
        reject(error);
      });
  });
}

async function insertBatch(records: any[]) {
  if (records.length === 0) return;
  
  try {
    await db.insert(ukHpi).values(records);
  } catch (error) {
    console.error('Error inserting batch:', error);
    throw error;
  }
}

// Run the import if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  importUkHpiData()
    .then(() => {
      console.log('Import completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Import failed:', error);
      process.exit(1);
    });
}

export { importUkHpiData };