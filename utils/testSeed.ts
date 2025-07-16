import { clearAllData, seedFakeData } from './seedData';

/**
 * Test script to clear data and seed with new habits having different creation dates.
 * This will help test the date filtering functionality.
 */
export const testSeedData = async () => {
  try {
    console.log('🧪 Starting seed data test...');

    // Clear all existing data
    await clearAllData();
    console.log('✅ Data cleared');

    // Seed with new data
    await seedFakeData();
    console.log('✅ Seed data completed');

    console.log('🎉 Test completed! Now you can:');
    console.log('   • Navigate to July 1-17 to see different habits');
    console.log(
      '   • Create a new habit and see it only appears from creation date'
    );
    console.log('   • Check stats to see all-time totals');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};
