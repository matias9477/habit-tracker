import { clearAllData, seedFakeData } from './seedData';

/**
 * Test script to clear data and seed with new habits having different creation dates.
 * This will help test the date filtering functionality.
 */
export const testSeedData = async () => {
  try {
    // Clear all existing data
    await clearAllData();

    // Seed with new data
    await seedFakeData();
  } catch (error) {
    // Error handling without console.log
    throw error;
  }
};
