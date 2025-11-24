#!/usr/bin/env ts-node

/**
 * Manual Test Data Cleanup Script
 * 
 * Use this script to manually clean up test data if automated cleanup failed.
 * 
 * Usage:
 *   npx ts-node tests/integration/cleanup-test-data.ts
 */

import { cleanupByPrefix, verifyCleanup } from './helpers/cleanup-helpers';
import { supabaseAdmin } from './setup';

async function main() {
  console.log('🧹 Manual Test Data Cleanup\n');
  console.log('This will delete all test data with the following prefixes:');
  console.log('  - Email: test-integration-*');
  console.log('  - Class codes: TEST-INT-*');
  console.log('  - Assignments: TEST-INT-ASSIGN-*');
  console.log('');
  
  try {
    // Perform cleanup
    await cleanupByPrefix();
    
    // Wait a moment for deletions to propagate
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verify cleanup was successful
    console.log('\n🔍 Verifying cleanup...\n');
    const verification = await verifyCleanup();
    
    if (verification.success) {
      console.log('✅ All test data successfully removed!\n');
    } else {
      console.log('⚠️  Some test data may remain:\n');
      console.log(JSON.stringify(verification.remainingData, null, 2));
      console.log('\nYou may need to manually check the database.\n');
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the cleanup
main();

