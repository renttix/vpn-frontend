import { NextRequest, NextResponse } from 'next/server';
import { makeHubSpotApiRequest } from '@/lib/hubspot';

/**
 * API endpoint to test the HubSpot connection
 * This endpoint makes a simple API call to HubSpot to verify that the API key is working
 * 
 * @returns JSON response with HubSpot account information or error details
 */
export async function GET(request: NextRequest) {
  try {
    // Check if HubSpot API key is configured
    if (!process.env.HUBSPOT_API_KEY) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'HubSpot API key not configured',
          details: 'Please add HUBSPOT_API_KEY to your .env file'
        },
        { status: 500 }
      );
    }

    // Test account info endpoint
    const accountInfo = await makeHubSpotApiRequest('account-info/v3/details');
    
    // Define types for status objects
    type CrmStatus = {
      success: boolean;
      contacts: number;
      error?: string;
    };

    type FormsStatus = {
      success: boolean;
      forms: number;
      firstFormName: string | null;
      error?: string;
    };

    // Test CRM API access
    let crmStatus: CrmStatus = { success: true, contacts: 0 };
    try {
      const crmResponse = await makeHubSpotApiRequest('crm/v3/objects/contacts?limit=1');
      crmStatus.contacts = crmResponse.total || 0;
    } catch (error) {
      crmStatus = { 
        success: false, 
        contacts: 0,
        error: error instanceof Error ? error.message : String(error)
      };
    }
    
    // Test Forms API access
    let formsStatus: FormsStatus = { success: true, forms: 0, firstFormName: null };
    try {
      const formsResponse = await makeHubSpotApiRequest('forms/v2/forms?limit=1');
      formsStatus.forms = formsResponse.length || 0;
      if (formsResponse.length > 0) {
        formsStatus.firstFormName = formsResponse[0].name;
      }
    } catch (error) {
      formsStatus = { 
        success: false, 
        forms: 0,
        firstFormName: null,
        error: error instanceof Error ? error.message : String(error)
      };
    }

    // Return the test results
    return NextResponse.json({
      success: true,
      message: 'HubSpot connection successful',
      accountInfo,
      crmStatus,
      formsStatus,
      apiKeyPreview: `${process.env.HUBSPOT_API_KEY?.substring(0, 8)}...${process.env.HUBSPOT_API_KEY?.substring(process.env.HUBSPOT_API_KEY.length - 4)}`
    });
  } catch (error) {
    console.error('Error testing HubSpot connection:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to connect to HubSpot', 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
