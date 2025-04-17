/**
 * HubSpot Connection Test Script
 * 
 * This script tests the connection to HubSpot using the provided API key.
 * It makes a simple API call to retrieve account information and verify that
 * the API key is working correctly.
 * 
 * Usage:
 * 1. Make sure your API key is set in the .env file
 * 2. Run this script with: node test-hubspot-connection.js
 */

// Load environment variables from .env file
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), 'frontend', '.env') });

// Check if API key is set
const apiKey = process.env.HUBSPOT_API_KEY;
if (!apiKey) {
  console.error('Error: HUBSPOT_API_KEY is not set in the .env file');
  process.exit(1);
}

// Function to test the HubSpot connection
async function testHubSpotConnection() {
  try {
    console.log('Testing HubSpot connection...');
    console.log(`Using API key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
    
    // Make a request to the HubSpot API to get account information
    const response = await fetch('https://api.hubapi.com/account-info/v3/details', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HubSpot API error: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    
    console.log('\n✅ Connection successful!');
    console.log('\nAccount Information:');
    console.log('-------------------');
    console.log(`Hub ID: ${data.portalId}`);
    console.log(`Name: ${data.name}`);
    console.log(`Domain: ${data.domain}`);
    console.log(`Currency: ${data.currency}`);
    console.log(`Timezone: ${data.timeZone}`);
    
    // Test CRM API access
    console.log('\nTesting CRM API access...');
    const crmResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!crmResponse.ok) {
      console.log('❌ CRM API access failed. Check if your API key has the required scopes.');
      const errorText = await crmResponse.text();
      console.error(`Error: ${errorText}`);
    } else {
      console.log('✅ CRM API access successful!');
      const crmData = await crmResponse.json();
      console.log(`Total contacts: ${crmData.total}`);
    }
    
    // Test Forms API access
    console.log('\nTesting Forms API access...');
    const formsResponse = await fetch('https://api.hubapi.com/forms/v2/forms?limit=1', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!formsResponse.ok) {
      console.log('❌ Forms API access failed. Check if your API key has the required scopes.');
      const errorText = await formsResponse.text();
      console.error(`Error: ${errorText}`);
    } else {
      console.log('✅ Forms API access successful!');
      const formsData = await formsResponse.json();
      console.log(`Forms available: ${formsData.length}`);
      if (formsData.length > 0) {
        console.log(`First form name: ${formsData[0].name}`);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the test
testHubSpotConnection();
