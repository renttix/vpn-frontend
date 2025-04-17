/**
 * HubSpot API Integration Utility
 * 
 * This file provides utilities for interacting with the HubSpot API.
 * It supports form submissions, contact creation, email marketing, and other HubSpot operations.
 */

// Types for HubSpot API requests
interface HubSpotContact {
  email: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  company?: string;
  [key: string]: any; // Allow for custom properties
}

interface HubSpotFormSubmission {
  fields: {
    name: string;
    value: string;
  }[];
  context?: {
    pageUri: string;
    pageName?: string;
    ipAddress?: string;
  };
  legalConsentOptions?: {
    consent: {
      consentToProcess: boolean;
      text: string;
      communications: {
        value: boolean;
        subscriptionTypeId: number;
        text: string;
      }[];
    };
  };
}

// Interface for CRM API contact properties
interface HubSpotContactProperties {
  properties: {
    [key: string]: string;
  };
}

// Interface for email marketing
interface HubSpotEmailProperties {
  name: string;
  type: 'AUTOMATED' | 'BATCH';
  content: {
    subject: string;
    body: string;
  };
  settings?: {
    contentType: 'HTML' | 'TEXT';
    replyTo?: string;
    fromName?: string;
  };
}

// Interface for contact lists
interface HubSpotListProperties {
  name: string;
  dynamic: boolean;
  filters?: {
    propertyName: string;
    operator: 'EQ' | 'NEQ' | 'CONTAINS' | 'NOT_CONTAINS' | 'GT' | 'LT';
    value: string;
  }[];
}

// Interface for tracking user behavior
interface HubSpotTrackingEvent {
  email: string;
  eventName: string;
  properties?: {
    [key: string]: string;
  };
}

/**
 * Make an authenticated request to the HubSpot API
 * @param endpoint HubSpot API endpoint (without the base URL)
 * @param method HTTP method
 * @param data Request data
 * @returns Response from HubSpot API
 */
export async function makeHubSpotApiRequest(
  endpoint: string,
  method: string = 'GET',
  data?: any
): Promise<any> {
  try {
    const apiKey = process.env.HUBSPOT_API_KEY;
    
    if (!apiKey) {
      throw new Error('HubSpot API key not configured');
    }
    
    const url = `https://api.hubapi.com/${endpoint}`;
    
    const headers: HeadersInit = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };
    
    const requestOptions: RequestInit = {
      method,
      headers
    };
    
    if (data) {
      requestOptions.body = JSON.stringify(data);
    }
    
    console.log(`Making HubSpot API request to ${endpoint}`);
    
    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorDetails = '';
      
      try {
        // Try to parse the error response as JSON for more details
        const errorJson = JSON.parse(errorText);
        errorDetails = JSON.stringify(errorJson, null, 2);
      } catch {
        // If not JSON, use the raw text
        errorDetails = errorText;
      }
      
      console.error(`HubSpot API error (${response.status}):`, errorDetails);
      throw new Error(`HubSpot API error: ${response.status} - ${errorDetails}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error making HubSpot API request:', error);
    throw error;
  }
}

/**
 * Submit data to a HubSpot form using the API key
 * @param formData Form data to submit
 * @param pageUri Current page URI
 * @param pageName Current page name
 * @returns Response from HubSpot API
 */
export async function submitToHubSpotFormWithApiKey(
  formData: Record<string, string>,
  pageUri: string,
  pageName?: string
): Promise<any> {
  try {
    // Format the form data for HubSpot
    const formattedData = formatFormDataForHubSpot(formData, pageUri, pageName);
    
    // Create a contact in HubSpot CRM
    const contactProperties: Record<string, string> = {};
    
    // Map form fields to contact properties
    formattedData.fields.forEach(field => {
      // Map common fields to HubSpot contact properties
      if (field.name === 'email') contactProperties.email = field.value;
      
      // Handle both camelCase and lowercase field names for first/last name
      if (field.name === 'firstName' || field.name === 'firstname') contactProperties.firstname = field.value;
      if (field.name === 'lastName' || field.name === 'lastname') contactProperties.lastname = field.value;
      
      if (field.name === 'phone') contactProperties.phone = field.value;
      if (field.name === 'company') contactProperties.company = field.value;
      
      // Add other fields as custom properties
      contactProperties[field.name] = field.value;
    });
    
    // Debug log the contact properties
    console.log('Contact properties being sent to HubSpot:', contactProperties);
    
    // Add form metadata
    contactProperties.form_submission_page = pageUri;
    contactProperties.form_submission_type = pageName || 'Website Form';
    contactProperties.form_submission_date = new Date().getTime().toString();
    
    // Create or update the contact
    return await createOrUpdateContactWithApiKey(contactProperties);
  } catch (error) {
    console.error('Error submitting to HubSpot form with API key:', error);
    throw error;
  }
}

/**
 * Create or update a contact in HubSpot using the API key
 * @param properties Contact properties
 * @returns Response from HubSpot API
 */
export async function createOrUpdateContactWithApiKey(
  properties: Record<string, string>
): Promise<any> {
  try {
    // Ensure email is provided
    if (!properties.email) {
      throw new Error('Email is required to create or update a contact');
    }
    
    // Ensure required fields have values
    if (!properties.firstname) {
      console.warn('First name is missing, adding default value');
      properties.firstname = 'Anonymous';
    }
    
    if (!properties.lastname) {
      console.warn('Last name is missing, adding default value');
      properties.lastname = 'User';
    }
    
    // Format properties for the HubSpot API v1 format
    const propertiesArray = Object.entries(properties)
      .filter(([key]) => key !== 'email') // Email is in the URL
      .map(([key, value]) => ({
        property: key,
        value: value || '' // Ensure no undefined values
      }));
    
    const formattedData = { properties: propertiesArray };
    
    // Log the formatted data for debugging
    console.log('Formatted data for HubSpot API:', JSON.stringify(formattedData, null, 2));
    
    // Use the v1 contacts API which is known to work
    // Skip trying the v3 API since we know it gives a 405 Method Not Allowed error
    console.log(`Creating/updating contact with email: ${properties.email}`);
    
    try {
      return await makeHubSpotApiRequest(
        `contacts/v1/contact/createOrUpdate/email/${encodeURIComponent(properties.email)}`,
        'POST',
        formattedData
      );
    } catch (error: unknown) {
      // Log detailed API error
      console.error('HubSpot API error details:', error);
      
      // Try with minimal required fields if the full request fails
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('400')) {
        console.log('Retrying with minimal required fields...');
        
        // Create minimal properties array with just the essential fields
        const minimalProperties = [
          { property: 'firstname', value: properties.firstname || 'Anonymous' },
          { property: 'lastname', value: properties.lastname || 'User' }
        ];
        
        try {
          return await makeHubSpotApiRequest(
            `contacts/v1/contact/createOrUpdate/email/${encodeURIComponent(properties.email)}`,
            'POST',
            { properties: minimalProperties }
          );
        } catch (fallbackError) {
          console.error('Failed even with minimal fields:', fallbackError);
          throw fallbackError;
        }
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Error creating/updating HubSpot contact with API key:', error);
    throw error;
  }
}

/**
 * Format form data for HubSpot submission
 * @param formData Form data from a standard form
 * @param pageUri Current page URI
 * @param pageName Current page name
 * @returns Formatted data for HubSpot
 */
export function formatFormDataForHubSpot(
  formData: Record<string, string>,
  pageUri: string,
  pageName?: string
): HubSpotFormSubmission {
  // Convert form data to HubSpot format
  const fields = Object.entries(formData).map(([name, value]) => ({
    name,
    value
  }));
  
  return {
    fields,
    context: {
      pageUri,
      pageName,
      ipAddress: ''  // This will be filled in by the server
    },
    legalConsentOptions: {
      consent: {
        consentToProcess: true,
        text: "I agree to allow VPN News to store and process my personal data.",
        communications: [
          {
            value: true,
            subscriptionTypeId: 999,  // Replace with actual subscription type ID
            text: "I agree to receive marketing communications from VPN News."
          }
        ]
      }
    }
  };
}

/**
 * Submit form data to HubSpot
 * This is the main function to use for form submissions
 * @param formData Form data from a standard form
 * @param pageUri Current page URI
 * @param pageName Current page name
 * @returns Response from HubSpot API
 */
export async function submitFormToHubSpot(
  formData: Record<string, string>,
  pageUri: string,
  pageName?: string
): Promise<any> {
  return submitToHubSpotFormWithApiKey(formData, pageUri, pageName);
}

/**
 * Create a contact list in HubSpot
 * @param listProperties Properties for the contact list
 * @returns Response from HubSpot API
 */
export async function createContactList(
  listProperties: HubSpotListProperties
): Promise<any> {
  try {
    // Format the list properties for HubSpot
    const formattedData = {
      name: listProperties.name,
      dynamic: listProperties.dynamic,
      filters: listProperties.filters ? listProperties.filters.map(filter => ({
        propertyName: filter.propertyName,
        operator: filter.operator,
        value: filter.value
      })) : []
    };
    
    // Create the list in HubSpot
    return await makeHubSpotApiRequest(
      'contacts/v1/lists',
      'POST',
      formattedData
    );
  } catch (error) {
    console.error('Error creating HubSpot contact list:', error);
    throw error;
  }
}

/**
 * Create a static contact list for a specific form type
 * @param formType The type of form (contact, enquiry, newsletter)
 * @returns Response from HubSpot API with the created list
 */
export async function createFormTypeList(formType: string): Promise<any> {
  const listName = `${formType.charAt(0).toUpperCase() + formType.slice(1)} Form Submissions`;
  
  return createContactList({
    name: listName,
    dynamic: true,
    filters: [
      {
        propertyName: 'form_submission_type',
        operator: 'EQ',
        value: formType
      }
    ]
  });
}

/**
 * Create an email campaign in HubSpot
 * @param emailProperties Properties for the email campaign
 * @returns Response from HubSpot API
 */
export async function createEmailCampaign(
  emailProperties: HubSpotEmailProperties
): Promise<any> {
  try {
    // Format the email properties for HubSpot
    const formattedData = {
      name: emailProperties.name,
      type: emailProperties.type,
      content: {
        subject: emailProperties.content.subject,
        body: emailProperties.content.body
      },
      settings: emailProperties.settings || {
        contentType: 'HTML',
        replyTo: 'noreply@vpnnews.co.uk',
        fromName: 'VPN News'
      }
    };
    
    // Create the email campaign in HubSpot
    return await makeHubSpotApiRequest(
      'marketing/v3/emails',
      'POST',
      formattedData
    );
  } catch (error) {
    console.error('Error creating HubSpot email campaign:', error);
    throw error;
  }
}

/**
 * Create a welcome email for new subscribers
 * @returns Response from HubSpot API with the created email
 */
export async function createWelcomeEmail(): Promise<any> {
  return createEmailCampaign({
    name: 'Welcome to VPN News',
    type: 'AUTOMATED',
    content: {
      subject: 'Welcome to VPN News - Thank You for Subscribing!',
      body: `
        <html>
          <body>
            <h1>Welcome to VPN News!</h1>
            <p>Thank you for subscribing to our newsletter. We're excited to have you join our community.</p>
            <p>Here's what you can expect from us:</p>
            <ul>
              <li>Latest news and updates in the VPN industry</li>
              <li>Expert analysis and commentary</li>
              <li>Tips and guides for online privacy and security</li>
            </ul>
            <p>Stay tuned for our next newsletter!</p>
            <p>Best regards,<br>The VPN News Team</p>
          </body>
        </html>
      `
    },
    settings: {
      contentType: 'HTML',
      replyTo: 'noreply@vpnnews.co.uk',
      fromName: 'VPN News Team'
    }
  });
}

/**
 * Track a user event in HubSpot
 * Note: This function is a no-op for free HubSpot accounts without analytics
 * @param trackingEvent Event data to track
 * @returns Promise that resolves to null for free accounts
 */
export async function trackUserEvent(
  trackingEvent: HubSpotTrackingEvent
): Promise<any> {
  // Log the event for debugging purposes
  console.log(`[Free Account] Would track event ${trackingEvent.eventName} for ${trackingEvent.email} if analytics were available`);
  console.log('Event properties:', trackingEvent.properties || {});
  
  // For free accounts, just return null without making API calls
  return null;
}

/**
 * Add enhanced properties to a contact in HubSpot
 * @param email Contact email
 * @param properties Additional properties to add
 * @returns Response from HubSpot API
 */
export async function addEnhancedContactProperties(
  email: string,
  properties: Record<string, string>
): Promise<any> {
  try {
    // Add lead scoring properties
    const enhancedProperties = {
      ...properties,
      lead_score: properties.lead_score || '0',
      last_activity_date: new Date().getTime().toString(),
      user_interests: properties.user_interests || '',
      subscription_status: properties.subscription_status || 'subscribed'
    };
    
    // Create or update the contact with enhanced properties
    return await createOrUpdateContactWithApiKey({
      email,
      ...enhancedProperties
    });
  } catch (error) {
    console.error('Error adding enhanced contact properties:', error);
    throw error;
  }
}

// Legacy functions for backward compatibility

/**
 * Submit data to a HubSpot form (Legacy method)
 * @param portalId HubSpot portal ID
 * @param formId HubSpot form ID
 * @param data Form data to submit
 * @returns Response from HubSpot API
 * @deprecated Use submitFormToHubSpot instead
 */
export async function submitToHubSpotForm(
  portalId: string,
  formId: string,
  data: HubSpotFormSubmission
): Promise<any> {
  try {
    const url = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HubSpot API error: ${response.status} ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting to HubSpot form:', error);
    throw error;
  }
}

/**
 * Create or update a contact in HubSpot (Legacy method)
 * @param apiKey HubSpot API key
 * @param contact Contact data
 * @returns Response from HubSpot API
 * @deprecated Use createOrUpdateContactWithApiKey instead
 */
export async function createOrUpdateContact(
  apiKey: string,
  contact: HubSpotContact
): Promise<any> {
  try {
    // Use the contacts API to create or update a contact
    const url = `https://api.hubapi.com/contacts/v1/contact/createOrUpdate/email/${encodeURIComponent(contact.email)}`;
    
    // Format properties for the HubSpot API
    const properties = Object.entries(contact)
      .filter(([key]) => key !== 'email') // Email is in the URL
      .map(([key, value]) => ({
        property: key,
        value: value
      }));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ properties })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HubSpot API error: ${response.status} ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating/updating HubSpot contact:', error);
    throw error;
  }
}
