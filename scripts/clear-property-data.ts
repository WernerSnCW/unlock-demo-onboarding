import { db } from '../server/db';
import { propertyPriceData } from '../shared/schema';
import { sql } from 'drizzle-orm';

async function clearPropertyData() {
  console.log('Clearing all property price data...');
  
  try {
    // Get current count
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(propertyPriceData);
    const currentCount = countResult[0]?.count || 0;
    
    console.log(`Found ${currentCount} existing records`);
    
    if (currentCount > 0) {
      // Clear all data
      await db.delete(propertyPriceData);
      console.log(`✓ Successfully cleared ${currentCount} property price records`);
    } else {
      console.log('No records to clear');
    }
    
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}

// Run the clear operation
clearPropertyData().then(() => {
  console.log('Clear operation completed');
  process.exit(0);
}).catch((error) => {
  console.error('Clear operation failed:', error);
  process.exit(1);
});