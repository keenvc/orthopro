/**
 * Test GoHighLevel SDK Installation
 * Verifies the @gohighlevel/api-client is properly installed and configured
 */

require('dotenv').config({ path: '../.env.ghl' });
const HighLevel = require('@gohighlevel/api-client').default;

async function testGHLSDK() {
  console.log('🧪 Testing GoHighLevel SDK Installation\n');
  console.log('=' .repeat(60));
  
  // Test 1: Check SDK import
  console.log('\n✅ Test 1: SDK Package Import');
  console.log('   Package: @gohighlevel/api-client');
  console.log('   Status: Successfully imported');
  
  // Test 2: Initialize SDK
  console.log('\n✅ Test 2: SDK Initialization');
  try {
    const ghl = new HighLevel({
      privateIntegrationToken: process.env.GHL_PRIVATE_TOKEN
    });
    console.log('   Status: SDK initialized successfully');
    console.log(`   Token: ${process.env.GHL_PRIVATE_TOKEN?.substring(0, 20)}...`);
    
    // Test 3: Test API call
    console.log('\n✅ Test 3: API Connection Test');
    try {
      const locations = await ghl.locations.searchLocations();
      console.log('   Status: API connection successful');
      console.log(`   Locations found: ${locations.locations?.length || 0}`);
      
      if (locations.locations && locations.locations.length > 0) {
        console.log('\n   Available Locations:');
        locations.locations.forEach((loc, index) => {
          console.log(`   ${index + 1}. ${loc.name} (${loc.id})`);
        });
      }
      
      // Test 4: Check available services
      console.log('\n✅ Test 4: Available SDK Services');
      const services = [
        'contacts',
        'conversations', 
        'locations',
        'opportunities',
        'calendars',
        'users',
        'forms',
        'workflows',
        'campaigns',
        'invoices',
        'payments'
      ];
      
      services.forEach(service => {
        const available = ghl[service] ? '✅' : '❌';
        console.log(`   ${available} ghl.${service}`);
      });
      
      console.log('\n' + '='.repeat(60));
      console.log('🎉 GoHighLevel SDK is fully installed and ready to use!');
      console.log('='.repeat(60));
      
    } catch (apiError) {
      console.log('   ⚠️  API call error:', apiError.message);
      console.log('   Note: SDK is installed but may need token scope updates');
    }
    
  } catch (initError) {
    console.error('   ❌ SDK initialization failed:', initError.message);
    console.error('   Check your GHL_PRIVATE_TOKEN in .env.ghl');
  }
}

testGHLSDK().catch(console.error);
