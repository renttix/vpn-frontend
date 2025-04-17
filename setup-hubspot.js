/**
 * HubSpot Integration Setup Script
 * 
 * This script initializes the HubSpot integration by setting up:
 * 1. Contact lists for different form types
 * 2. Welcome email for newsletter subscribers
 * 3. Custom contact properties for enhanced contact management
 * 
 * Usage:
 * 1. Make sure your API key is set in the .env file
 * 2. Run this script with: node setup-hubspot.js
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

// Function to create a contact list
async function createContactList(name, dynamic, filters) {
  try {
    console.log(`Creating contact list: ${name}`);
    
    const formattedData = {
      name,
      dynamic,
      filters: filters || []
    };
    
    return await makeHubSpotApiRequest(
      'contacts/v1/lists',
      'POST',
      formattedData
    );
  } catch (error) {
    console.error(`Error creating contact list "${name}":`, error);
    return null;
  }
}

// Function to create a form type list
async function createFormTypeList(formType) {
  const listName = `${formType.charAt(0).toUpperCase() + formType.slice(1)} Form Submissions`;
  
  return createContactList(listName, true, [
    {
      propertyName: 'form_submission_type',
      operator: 'EQ',
      value: formType
    }
  ]);
}

// Function to create an email campaign
async function createEmailCampaign(name, type, subject, body, settings) {
  try {
    console.log(`Creating email campaign: ${name}`);
    
    const formattedData = {
      name,
      type,
      content: {
        subject,
        body
      },
      settings: settings || {
        contentType: 'HTML',
        replyTo: 'noreply@vpnnews.co.uk',
        fromName: 'VPN News'
      }
    };
    
    return await makeHubSpotApiRequest(
      'marketing/v3/emails',
      'POST',
      formattedData
    );
  } catch (error) {
    console.error(`Error creating email campaign "${name}":`, error);
    return null;
  }
}

// Function to create a welcome email
async function createWelcomeEmail() {
  return createEmailCampaign(
    'Welcome to VPN News',
    'AUTOMATED',
    'Welcome to VPN News - Your Source for Trusted Journalism',
    `
      <html>
        <body>
          <h1>Welcome to VPN News!</h1>
          <p>Thank you for subscribing to our newsletter. We're excited to have you join our community of informed readers.</p>
          
          <h2>Discover Our Top Categories</h2>
          <ul>
            <li><strong>Breaking News</strong> - Stay informed with the latest developments as they happen</li>
            <li><strong>In-Depth Analysis</strong> - Understand the context behind the headlines</li>
            <li><strong>Investigative Reporting</strong> - Uncovering stories that matter</li>
            <li><strong>Opinion & Commentary</strong> - Diverse perspectives on current events</li>
          </ul>
          
          <h2>Reader Benefits</h2>
          <ul>
            <li>Exclusive content not available on our website</li>
            <li>Early access to major investigative reports</li>
            <li>Curated reading lists from our editors</li>
            <li>Opportunity to participate in reader surveys and shape our coverage</li>
          </ul>
          
          <p>We respect your time and inbox - you can customize your newsletter preferences at any time by visiting your <a href="https://www.vpnnews.co.uk/account/preferences">account preferences</a>.</p>
          
          <p>Have a news tip? <a href="https://www.vpnnews.co.uk/contact-us">Contact our editorial team</a>.</p>
          
          <p>Stay informed,<br>The VPN News Editorial Team</p>
        </body>
      </html>
    `,
    {
      contentType: 'HTML',
      replyTo: 'newsletter@vpnnews.co.uk',
      fromName: 'VPN News Editorial Team'
    }
  );
}

// Function to create custom contact properties
async function createCustomContactProperty(name, label, type, groupName, description, additionalProps = {}) {
  try {
    console.log(`Creating custom contact property: ${name}`);
    
    const formattedData = {
      name,
      label,
      type,
      groupName,
      description,
      ...additionalProps
    };
    
    return await makeHubSpotApiRequest(
      'properties/v1/contacts/properties',
      'POST',
      formattedData
    );
  } catch (error) {
    console.error(`Error creating custom contact property "${name}":`, error);
    return null;
  }
}

// Main function to set up HubSpot integration
async function setupHubSpotIntegration() {
  console.log('Setting up HubSpot integration...');
  console.log(`Using API key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
  
  try {
    // Create contact lists for different form types
    console.log('\n1. Creating contact lists...');
    const contactList = await createFormTypeList('contact');
    const enquiryList = await createFormTypeList('enquiry');
    const newsletterList = await createFormTypeList('newsletter');
    
    // Create welcome email for newsletter subscribers
    console.log('\n2. Creating welcome email...');
    const welcomeEmail = await createWelcomeEmail();
    
    // Create custom contact properties for enhanced contact management
    console.log('\n3. Creating custom contact properties...');
    
    // Lead scoring property
    await createCustomContactProperty(
      'lead_score',
      'Lead Score',
      'number',
      'contactinformation',
      'A score indicating the lead\'s potential value (0-100)'
    );
    
    // User interests property
    await createCustomContactProperty(
      'user_interests',
      'User Interests',
      'string',
      'contactinformation',
      'Topics and areas the user has shown interest in'
    );
    
    // Subscription status property
    await createCustomContactProperty(
      'subscription_status',
      'Subscription Status',
      'enumeration',
      'contactinformation',
      'Current subscription status (subscribed, unsubscribed, pending)',
      {
        options: [
          { label: 'Subscribed', value: 'subscribed' },
          { label: 'Unsubscribed', value: 'unsubscribed' },
          { label: 'Pending', value: 'pending' }
        ]
      }
    );
    
    // Form submission count property
    await createCustomContactProperty(
      'form_submission_count',
      'Form Submission Count',
      'number',
      'contactinformation',
      'Number of forms submitted by this contact'
    );
    
    // Last form type property
    await createCustomContactProperty(
      'last_form_type',
      'Last Form Type',
      'string',
      'contactinformation',
      'Type of the last form submitted (contact, enquiry, newsletter)'
    );
    
    // Newsletter frequency preference
    await createCustomContactProperty(
      'newsletter_frequency',
      'Newsletter Frequency',
      'enumeration',
      'contactinformation',
      'Preferred frequency for receiving newsletters',
      {
        options: [
          { label: 'Daily', value: 'daily' },
          { label: 'Weekly', value: 'weekly' },
          { label: 'Monthly', value: 'monthly' },
          { label: 'Breaking News Only', value: 'breaking' }
        ]
      }
    );
    
    // Content categories of interest
    await createCustomContactProperty(
      'content_categories',
      'Content Categories',
      'enumeration',
      'contactinformation',
      'News categories the reader is interested in',
      {
        options: [
          { label: 'Breaking News', value: 'breaking' },
          { label: 'Politics', value: 'politics' },
          { label: 'Technology', value: 'technology' },
          { label: 'Business', value: 'business' },
          { label: 'Health', value: 'health' },
          { label: 'Science', value: 'science' },
          { label: 'Entertainment', value: 'entertainment' },
          { label: 'Sports', value: 'sports' },
          { label: 'Opinion', value: 'opinion' }
        ]
      }
    );
    
    // Article reading count
    await createCustomContactProperty(
      'articles_read_count',
      'Articles Read Count',
      'number',
      'contactinformation',
      'Number of articles the reader has viewed'
    );
    
    // Most recent article read
    await createCustomContactProperty(
      'last_article_read',
      'Last Article Read',
      'string',
      'contactinformation',
      'Title and URL of the most recent article the reader viewed'
    );
    
    // Average time spent on articles
    await createCustomContactProperty(
      'avg_article_time',
      'Average Article Time',
      'number',
      'contactinformation',
      'Average time in seconds spent reading articles'
    );
    
    console.log('\n✅ HubSpot integration setup complete!');
    console.log('You can now use the enhanced contact management and email marketing features.');
    
  } catch (error) {
    console.error('\n❌ Error setting up HubSpot integration:', error);
    process.exit(1);
  }
}

// Run the setup
setupHubSpotIntegration();
