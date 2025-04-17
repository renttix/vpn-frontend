import { NextRequest, NextResponse } from 'next/server';
import { 
  submitFormToHubSpot, 
  addEnhancedContactProperties, 
  trackUserEvent,
  createFormTypeList,
  createWelcomeEmail
} from '@/lib/hubspot';

// Verify reCAPTCHA token (supports both v2 and v3)
async function verifyRecaptcha(token: string, version: 'v2' | 'v3' = 'v3'): Promise<boolean> {
  // Special handling for development mode
  if (process.env.NODE_ENV !== 'production') {
    // In development, accept 'dev-token' as a valid token for testing
    if (token === 'dev-token') {
      console.log('Using development token for reCAPTCHA verification');
      return true;
    }
    
    // If no token is provided in development, still allow it
    if (!token) {
      console.warn('No reCAPTCHA token provided, but allowing in development mode');
      return true;
    }
  } else if (!token) {
    // In production, fail if no token is provided
    console.error('No reCAPTCHA token provided in production');
    return false;
  }

  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    
    // If no secret key is configured, skip verification in development
    if (!secretKey) {
      console.warn('RECAPTCHA_SECRET_KEY is not set');
      return process.env.NODE_ENV !== 'production';
    }

    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
      { method: 'POST' }
    );

    const data = await response.json();
    
    // For reCAPTCHA v2, we only need to check data.success
    // For reCAPTCHA v3, we need to check both data.success and data.score
    if (data.success) {
      // If v3 and score is present, check if it meets the threshold
      if (version === 'v3' && typeof data.score !== 'undefined') {
        return data.score >= 0.5;
      }
      // If v2 or no score, just return success
      return true;
    }
    
    // In development, allow even if verification fails
    if (process.env.NODE_ENV !== 'production') {
      console.warn('reCAPTCHA verification failed, but allowing in development mode');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    // In development, allow even if verification throws an error
    return process.env.NODE_ENV !== 'production';
  }
}

export async function POST(request: NextRequest) {
  // Define variables at the top level to make them accessible in the catch block
  let formDataObj: Record<string, string> = {};
  let formType: string = 'unknown';
  
  try {
    // Check if HubSpot API key is configured
    if (!process.env.HUBSPOT_API_KEY) {
      console.error('HubSpot API key not configured');
      return NextResponse.json(
        { message: 'HubSpot integration not configured' },
        { status: 500 }
      );
    }

    // Get form data
    const formData = await request.formData();
    formType = formData.get('formType') as string || 'unknown';
    const recaptchaToken = formData.get('recaptchaToken') as string;

    // Get reCAPTCHA version
    const recaptchaVersion = formData.get('recaptchaVersion') as 'v2' | 'v3' || 'v3';
    
    // Verify reCAPTCHA
    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken, recaptchaVersion);
    if (!isRecaptchaValid) {
      return NextResponse.json(
        { message: 'reCAPTCHA verification failed' },
        { status: 400 }
      );
    }

    // Convert form data to a standard object
    formDataObj = {};
    for (const [key, value] of formData.entries()) {
      // Skip the formType and recaptchaToken fields
      if (key !== 'formType' && key !== 'recaptchaToken' && key !== 'recaptchaVersion' && typeof value === 'string') {
        formDataObj[key] = value;
      }
    }
    
    // Debug log the form data
    console.log('Form data being sent to HubSpot:', JSON.stringify(formDataObj, null, 2));
    
    // Ensure required fields are present
    if (!formDataObj.email) {
      console.error('Missing required email field');
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Ensure firstName and lastName are present for contact forms
    // Check for both camelCase and lowercase versions
    const hasFirstName = formDataObj.firstName || formDataObj.firstname;
    const hasLastName = formDataObj.lastName || formDataObj.lastname;
    
    if (formType === 'contact' && (!hasFirstName || !hasLastName)) {
      console.error('Missing required name fields for contact form');
      // Add default values if missing
      if (!hasFirstName) {
        formDataObj.firstname = 'Anonymous';
      }
      if (!hasLastName) {
        formDataObj.lastname = 'User';
      }
    }
    
    // Ensure consistent field naming for HubSpot
    // Convert camelCase to lowercase for firstName and lastName
    if (formDataObj.firstName && !formDataObj.firstname) {
      formDataObj.firstname = formDataObj.firstName;
      delete formDataObj.firstName;
    }
    
    if (formDataObj.lastName && !formDataObj.lastname) {
      formDataObj.lastname = formDataObj.lastName;
      delete formDataObj.lastName;
    }

    // Get page information
    const referer = request.headers.get('referer') || '';
    const pageUri = referer;
    const pageName = formType === 'contact' 
      ? 'Contact Form' 
      : formType === 'enquiry' 
        ? 'Enquiry Form' 
        : formType === 'newsletter'
          ? 'Newsletter Subscription'
          : 'Website Form';

    // Add IP address if available
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
    if (ipAddress) {
      formDataObj.ipAddress = ipAddress;
    }

    // Add form type metadata
    formDataObj.form_type = formType;
    formDataObj.submission_date = new Date().getTime().toString();

    // Submit to HubSpot using the new API
    const hubspotResponse = await submitFormToHubSpot(
      formDataObj,
      pageUri,
      pageName
    );

    // Get the email from the form data
    const email = formDataObj.email;
    if (!email) {
      return NextResponse.json({ 
        success: true, 
        hubspotResponse,
        warning: 'No email provided, skipping enhanced contact management'
      });
    }

    // Add enhanced contact properties based on form type
    let leadScore = '0';
    let userInterests = '';
    
    // Calculate lead score based on form type and available data
    if (formType === 'contact') {
      leadScore = '50'; // Medium priority
      userInterests = formDataObj.message || '';
    } else if (formType === 'enquiry') {
      leadScore = '75'; // High priority
      userInterests = formDataObj.message || '';
    } else if (formType === 'newsletter') {
      leadScore = '25'; // Lower priority but still interested
      userInterests = 'newsletter, general';
    }
    
    // Add enhanced properties
    await addEnhancedContactProperties(email, {
      lead_score: leadScore,
      user_interests: userInterests,
      subscription_status: 'subscribed',
      form_submission_count: '1', // Initial submission
      last_form_type: formType
    });
    
    // Attempt to track the form submission event (no-op for free accounts)
    await trackUserEvent({
      email,
      eventName: 'form_submission',
      properties: {
        form_type: formType,
        page_uri: pageUri,
        timestamp: new Date().getTime().toString()
      }
    });
    // Note: For free accounts, this won't actually send data to HubSpot
    
    // For newsletter subscriptions, ensure they're in the newsletter list
    // and send a welcome email
    if (formType === 'newsletter') {
      try {
        // Create or ensure the newsletter list exists
        await createFormTypeList('newsletter');
        
        // Create and send welcome email
        await createWelcomeEmail();
        
        // Attempt to track newsletter subscription event (no-op for free accounts)
        await trackUserEvent({
          email,
          eventName: 'newsletter_subscription',
          properties: {
            subscription_date: new Date().getTime().toString(),
            source: pageUri
          }
        });
        // Note: For free accounts, this won't actually send data to HubSpot
      } catch (error) {
        console.error('Error setting up newsletter subscription:', error);
        // Continue anyway, as the main form submission was successful
      }
    }

    return NextResponse.json({ 
      success: true, 
      hubspotResponse,
      enhanced: true,
      email_marketing: formType === 'newsletter'
    });
  } catch (error) {
    console.error('Error submitting to HubSpot:', error);
    
    // Extract more detailed error information
    let errorMessage = 'Failed to submit form to HubSpot';
    let errorDetails = String(error);
    let statusCode = 500;
    
    // Try to parse the error message for more details
    if (error instanceof Error) {
      const match = error.message.match(/HubSpot API error: (\d+) - (.*)/);
      if (match) {
        const [, errorStatusCode, details] = match;
        statusCode = parseInt(errorStatusCode, 10);
        errorMessage = `HubSpot API error (${statusCode})`;
        errorDetails = details;
        
        // Log the detailed error for debugging
        console.error(`Detailed HubSpot error: Status ${statusCode}, Details: ${details}`);
        
        // Log the form data that caused the error (if available)
        if (Object.keys(formDataObj).length > 0) {
          console.error('Form data that caused the error:', formDataObj);
        } else {
          console.error('No form data available to log');
        }
      }
    }
    
    // For 400 errors, try to provide more specific error messages
    if (statusCode === 400) {
      if (errorDetails.includes('property')) {
        errorMessage = 'Invalid property in form data';
      } else if (errorDetails.includes('format')) {
        errorMessage = 'Invalid data format';
      } else if (errorDetails.includes('required')) {
        errorMessage = 'Missing required field';
      }
      
      console.error('Specific 400 error diagnosis:', errorMessage);
    }
    
    return NextResponse.json(
      { 
        message: errorMessage, 
        error: errorDetails,
        timestamp: new Date().toISOString(),
        formType: formType || 'unknown'
      },
      { status: statusCode }
    );
  }
}
