import { readFileSync } from 'fs';
import { db } from '../server/db';
import { postcodeLadMapping } from '../shared/schema';

async function uploadPostcodeData() {
  console.log('Starting postcode data upload...');
  
  const csvFilePath = './attached_assets/extracted_postcodes_2025-08-28_1756382512125.csv';
  const batchSize = 1000;
  let totalProcessed = 0;
  let totalInserted = 0;

  try {
    // Read the entire file
    console.log('Reading CSV file...');
    const fileContent = readFileSync(csvFilePath, 'utf-8');
    const lines = fileContent.split('\n');
    
    // Skip header line
    const dataLines = lines.slice(1).filter(line => line.trim().length > 0);
    
    console.log(`Found ${dataLines.length} data lines to process`);
    
    // Process in batches
    for (let i = 0; i < dataLines.length; i += batchSize) {
      const batchLines = dataLines.slice(i, i + batchSize);
      const batch: { postcode: string; ladCode: string }[] = [];
      
      // Parse each line in the batch
      for (const line of batchLines) {
        const columns = line.split(',');
        const postcode = columns[0]?.trim();
        const ladCode = columns[1]?.trim();
        
        if (postcode && ladCode) {
          batch.push({ postcode, ladCode });
          totalProcessed++;
        }
      }
      
      // Insert the batch
      if (batch.length > 0) {
        try {
          await db.insert(postcodeLadMapping)
            .values(batch)
            .onConflictDoNothing(); // Skip duplicates if any
          
          totalInserted += batch.length;
          console.log(`Inserted batch ${Math.floor(i/batchSize) + 1}: ${batch.length} records. Total inserted: ${totalInserted}, Total processed: ${totalProcessed}`);
        } catch (error) {
          console.error('Error inserting batch:', error);
          throw error;
        }
      }
    }
    
    console.log(`✅ Upload completed! Total records processed: ${totalProcessed}, Total records inserted: ${totalInserted}`);
    return { totalProcessed, totalInserted };
    
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

// Run the upload
uploadPostcodeData()
  .then(() => {
    console.log('Postcode data upload completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Upload failed:', error);
    process.exit(1);
  });