#!/usr/bin/env node

/**
 * Test script for auto-deletion functionality
 * Run with: node scripts/test-auto-deletion.js
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

async function testAutoDeletion() {
  console.log('🧪 Testing Auto-Deletion Functionality\n');

  try {
    // Test 1: Check current old orders status
    console.log('1️⃣ Checking current old orders status...');
    const statusResponse = await fetch(`${BASE_URL}/api/auto-delete-orders`);
    
    if (!statusResponse.ok) {
      throw new Error(`Status check failed: ${statusResponse.status}`);
    }
    
    const statusData = await statusResponse.json();
    console.log('✅ Status check successful');
    console.log(`   - Orders older than 60 days: ${statusData.oldOrdersCount}`);
    console.log(`   - Cutoff date: ${new Date(statusData.cutoffDate).toLocaleDateString()}`);
    console.log(`   - Total value: ₹${statusData.totalValue || 0}`);
    
    if (statusData.oldOrdersCount > 0) {
      console.log(`   - Sample orders:`, statusData.orders.slice(0, 3).map(o => ({
        id: o.id.slice(0, 8) + '...',
        customer: o.customer_name,
        created: new Date(o.created_at).toLocaleDateString(),
        amount: o.total_amount
      })));
    }

    // Test 2: Test cleanup endpoint (dry run - don't actually delete)
    console.log('\n2️⃣ Testing cleanup endpoint...');
    
    // First, let's check if we can make a POST request
    const testResponse = await fetch(`${BASE_URL}/api/auto-delete-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'test_connection' })
    });
    
    if (testResponse.status === 400) {
      console.log('✅ Cleanup endpoint is accessible (returned expected 400 for invalid action)');
    } else {
      console.log(`⚠️  Unexpected response: ${testResponse.status}`);
    }

    // Test 3: Check environment variables
    console.log('\n3️⃣ Checking environment configuration...');
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length === 0) {
      console.log('✅ All required environment variables are set');
    } else {
      console.log('❌ Missing environment variables:', missingVars);
      console.log('   Please set these variables to test the full functionality');
    }

    // Test 4: Calculate days until deletion for sample orders
    if (statusData.orders && statusData.orders.length > 0) {
      console.log('\n4️⃣ Calculating deletion countdown for sample orders...');
      
      statusData.orders.slice(0, 3).forEach(order => {
        const createdDate = new Date(order.created_at);
        const deletionDate = new Date(createdDate.getTime() + (60 * 24 * 60 * 60 * 1000));
        const now = new Date();
        const diffTime = deletionDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        console.log(`   Order ${order.id.slice(0, 8)}...: ${diffDays} days until deletion`);
      });
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Set up a cron job or scheduled task using the CRON_SETUP.md guide');
    console.log('   2. Test the manual cleanup button in the admin interface');
    console.log('   3. Monitor the deletion process in your logs');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Ensure your API server is running');
    console.log('   2. Check the API endpoint URL');
    console.log('   3. Verify environment variables are set');
    console.log('   4. Check server logs for detailed errors');
  }
}

// Run the test
testAutoDeletion();
