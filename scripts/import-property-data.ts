import { readFileSync, readdirSync } from 'fs';
import { db } from '../server/db';
import { propertyPriceData } from '../shared/schema';

async function importPropertyData(csvFilePath?: string) {
  console.log('Starting property price data import...');
  
  try {
    let csvData: string;
    
    if (csvFilePath) {
      // Import specific file
      console.log(`Importing from: ${csvFilePath}`);
      csvData = readFileSync(csvFilePath, 'utf-8');
    } else {
      // Auto-detect CSV files in attached_assets
      const files = readdirSync('./attached_assets')
        .filter(file => file.endsWith('.csv') && file.includes('pp-'));
      
      if (files.length === 0) {
        console.log('No property price CSV files found in attached_assets/');
        return;
      }
      
      console.log(`Found ${files.length} property price CSV files:`);
      files.forEach(file => console.log(`  - ${file}`));
      
      // Use the most recent file (by name)
      const latestFile = files.sort().reverse()[0];
      console.log(`Using latest file: ${latestFile}`);
      csvData = readFileSync(`./attached_assets/${latestFile}`, 'utf-8');
    }
    const lines = csvData.trim().split('\n');
    
    console.log(`Found ${lines.length} records to import`);
    
    // Process in batches to avoid memory issues
    const batchSize = 1000;
    let imported = 0;
    
    for (let i = 0; i < lines.length; i += batchSize) {
      const batch = lines.slice(i, i + batchSize);
      const records = [];
      
      for (const line of batch) {
        try {
          // Parse CSV line (handling quoted values)
          const values = line.match(/("[^"]*"|\w+)/g)?.map(v => v.replace(/"/g, '')) || [];
          
          if (values.length >= 16) {
            const record = {
              transactionId: values[0],
              price: values[1],
              dateOfTransfer: values[2].split(' ')[0], // Extract date part only
              postcode: values[3],
              propertyType: values[4],
              oldNew: values[5],
              duration: values[6],
              primaryAddressableName: values[7] || null,
              secondaryAddressableName: values[8] || null,
              street: values[9] || null,
              locality: values[10] || null,
              townCity: values[11] || null,
              district: values[12] || null,
              county: values[13] || null,
              ppdCategoryType: values[14],
              recordStatus: values[15],
            };
            records.push(record);
          }
        } catch (error) {
          console.warn(`Skipping malformed line: ${line.substring(0, 100)}...`);
        }
      }
      
      if (records.length > 0) {
        await db.insert(propertyPriceData).values(records);
        imported += records.length;
        console.log(`Imported ${imported} / ${lines.length} records (${Math.round((imported / lines.length) * 100)}%)`);
      }
    }
    
    console.log(`✓ Successfully imported ${imported} property price records`);
    
    // Show some summary statistics
    const sampleData = await db.select().from(propertyPriceData).limit(5);
    console.log('\nSample records:');
    console.table(sampleData.map(r => ({
      price: `£${Number(r.price).toLocaleString()}`,
      postcode: r.postcode,
      type: r.propertyType,
      townCity: r.townCity,
      date: r.dateOfTransfer
    })));
    
  } catch (error) {
    console.error('Error importing data:', error);
  }
}

// Get command line arguments
const args = process.argv.slice(2);
const csvFilePath = args[0]; // Optional: specify a specific CSV file path

// Run the import
importPropertyData(csvFilePath).then(() => {
  console.log('Import process completed');
  process.exit(0);
}).catch((error) => {
  console.error('Import failed:', error);
  process.exit(1);
});