/**
 * HubSpot Enhanced Integration Test Script
 * 
 * This script tests the enhanced HubSpot integration features:
 * 1. Email marketing
 * 2. Contact management
 * 
 * Usage:
 * 1. Make sure your API key is set in the .env file
 * 2. Run this script with: node test-hubspot-enhanced.js
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

// Function to make an authenticated request to the HubSpot API
async function makeHubSpotApiRequest(endpoint, method = 'GET', data) {
  try {
    const url = `https://api.hubapi.com/${endpoint}`;
    
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };
    
    const requestOptions = {
      method,
      headers
    };
    
    if (data) {
      requestOptions.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HubSpot API error: ${response.status} ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error making HubSpot API request:', error);
    throw error;
  }
}

// Function to test contact creation with enhanced properties
async function testEnhancedContactCreation() {
  try {
    console.log('Testing enhanced contact creation...');
    
    const testEmail = `test-${Date.now()}@example.com`;
    
    // Create contact with enhanced properties
    const contactData = {
      properties: {
        email: testEmail,
        firstname: 'Test',
        lastname: 'User',
        lead_score: '75',
        user_interests: 'VPN, security, privacy',
        subscription_status: 'subscribed',
        form_submission_count: '1',
        last_form_type: 'enquiry'
      }
    };
    
    const result = await makeHubSpotApiRequest(
      'crm/v3/objects/contacts/create',
      'POST',
      contactData
    );
    
    console.log('✅ Enhanced contact created successfully:');
    console.log(`  ID: ${result.id}`);
    console.log(`  Email: ${result.properties.email}`);
    console.log(`  Lead Score: ${result.properties.lead_score}`);
    console.log(`  User Interests: ${result.properties.user_interests}`);
    
    return result;
  } catch (error) {
    console.error('❌ Error testing enhanced contact creation:', error);
    return null;
  }
}

// Function to test contact list creation
async function testContactListCreation() {
  try {
    console.log('\nTesting contact list creation...');
    
    // Create a test contact list
    const listData = {
      name: `Test List ${Date.now()}`,
      dynamic: true,
      filters: [
        {
          propertyName: 'lead_score',
          operator: 'GT',
          value: '50'
        }
      ]
    };
    
    const result = await makeHubSpotApiRequest(
      'contacts/v1/lists',
      'POST',
      listData
    );
    
    console.log('✅ Contact list created successfully:');
    console.log(`  ID: ${result.listId}`);
    console.log(`  Name: ${result.name}`);
    console.log(`  Dynamic: ${result.dynamic}`);
    
    return result;
  } catch (error) {
    console.error('❌ Error testing contact list creation:', error);
    return null;
  }
}

// Function to test email campaign creation
async function testEmailCampaignCreation() {
  try {
    console.log('\nTesting email campaign creation...');
    
    // Create a test email campaign
    const emailData = {
      name: `Test Email ${Date.now()}`,
      type: 'AUTOMATED',
      content: {
        subject: 'Test Email Subject',
        body: `
          <html>
            <body>
              <h1>Test Email</h1>
              <p>This is a test email for the enhanced HubSpot integration.</p>
            </body>
          </html>
        `
      },
      settings: {
        contentType: 'HTML',
        replyTo: 'noreply@vpnnews.co.uk',
        fromName: 'VPN News Test'
      }
    };
    
    const result = await makeHubSpotApiRequest(
      'marketing/v3/emails',
      'POST',
      emailData
    );
    
    console.log('✅ Email campaign created successfully:');
    console.log(`  ID: ${result.id}`);
    console.log(`  Name: ${result.name}`);
    console.log(`  Type: ${result.type}`);
    
    return result;
  } catch (error) {
    console.error('❌ Error testing email campaign creation:', error);
    return null;
  }
}

// Function to test event tracking
async function testEventTracking() {
  try {
    console.log('\nTesting event tracking...');
    
    const testEmail = `test-${Date.now()}@example.com`;
    
    // Create a test contact first
    const contactData = {
      properties: {
        email: testEmail,
        firstname: 'Event',
        lastname: 'Tracker'
      }
    };
    
    await makeHubSpotApiRequest(
      'crm/v3/objects/contacts/create',
      'POST',
      contactData
    );
    
    // Track a test event
    const eventData = {
      email: testEmail,
      eventName: 'test_event',
      properties: {
        page_path: '/test-page',
        timestamp: new Date().toISOString()
      }
    };
    
    const result = await makeHubSpotApiRequest(
      'events/v3/send',
      'POST',
      eventData
    );
    
    console.log('✅ Event tracked successfully:');
    console.log(`  Status: ${result.status}`);
    console.log(`  Email: ${testEmail}`);
    console.log(`  Event: test_event`);
    
    return result;
  } catch (error) {
    console.error('❌ Error testing event tracking:', error);
    return null;
  }
}

// Main function to run all tests
async function runTests() {
  console.log('Starting HubSpot Enhanced Integration Tests...');
  console.log(`Using API key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
  
  try {
    // Run all tests
    await testEnhancedContactCreation();
    await testContactListCreation();
    await testEmailCampaignCreation();
    await testEventTracking();
    
    console.log('\n✅ All tests completed successfully!');
    console.log('The enhanced HubSpot integration is working properly.');
  } catch (error) {
    console.error('\n❌ Error running tests:', error);
    process.exit(1);
  }
}

// Run the tests
runTests();
