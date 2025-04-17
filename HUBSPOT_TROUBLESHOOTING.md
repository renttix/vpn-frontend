# HubSpot Integration Troubleshooting Guide

This guide provides information on how to troubleshoot and fix issues with the HubSpot integration in the VPN News website.

## Recent Updates

We've made several improvements to the HubSpot integration:

1. **Enhanced reCAPTCHA Support**: Updated the system to properly handle both reCAPTCHA v2 and v3 verification.
2. **Improved Error Handling**: Added better error handling and logging for HubSpot API requests.
3. **Contact Creation/Update**: Fixed the contact creation and update process to use the correct HubSpot API endpoints.
4. **Testing Tools**: Added scripts to test the HubSpot API integration and update the API key.

## Common Issues and Solutions

### "Failed to submit form to HubSpot" Error

This error occurs when the form submission to HubSpot fails. Here are some possible causes and solutions:

1. **Invalid API Key**: The HubSpot API key may be invalid or expired.
   - Solution: Update the API key using the `update-hubspot-key.js` script.

2. **Network Issues**: The request to the HubSpot API may be failing due to network issues.
   - Solution: Check your internet connection and try again.

3. **API Rate Limiting**: HubSpot may be rate limiting your API requests.
   - Solution: Wait a few minutes and try again.

4. **Invalid Form Data**: The form data being submitted may be invalid.
   - Solution: Check the form data for any invalid fields.

5. **Method Not Allowed (405) Error**: This occurs when using an incorrect HTTP method or endpoint.
   - Solution: We've updated the code to use the correct v1 API endpoints instead of the v3 endpoints that were causing the 405 error. If you're still seeing this error, run the `test-hubspot-api.js` script to determine which API version works for your account.

### reCAPTCHA Verification Failed

This error occurs when the reCAPTCHA verification fails. Here are some possible causes and solutions:

1. **Invalid reCAPTCHA Keys**: The reCAPTCHA site key or secret key may be invalid.
   - Solution: Update the reCAPTCHA keys in the `.env` file.

2. **Wrong reCAPTCHA Version**: The reCAPTCHA version being used may not match the keys.
   - Solution: Make sure you're using the correct reCAPTCHA version (v2 or v3) with the corresponding keys.

3. **reCAPTCHA Not Loaded**: The reCAPTCHA script may not be loading properly.
   - Solution: Check the browser console for any errors related to reCAPTCHA.

## Testing the HubSpot Integration

We've added a script to test the HubSpot API integration. This script will verify that the API key is valid and that the contact creation and update endpoints are working correctly.

To run the test script:

```bash
cd frontend
node test-hubspot-api.js
```

The script will output detailed information about the API requests and responses, which can help diagnose issues with the HubSpot integration.

## Updating the HubSpot API Key

If you need to update the HubSpot API key, you can use the `update-hubspot-key.js` script:

```bash
cd frontend
node update-hubspot-key.js YOUR_NEW_API_KEY
```

Replace `YOUR_NEW_API_KEY` with your new HubSpot API key. The script will update the key in the `.env` file and provide feedback on the update.

## HubSpot API Endpoints

The integration uses the following HubSpot API endpoints:

### v1 API Endpoints (Primary)
- **Contact Creation/Update**: `contacts/v1/contact/createOrUpdate/email/{email}`
- **Event Tracking**: `contacts/v1/events`
- **Contact List Creation**: `contacts/v1/lists`

### v3 API Endpoints (Fallback)
- **Contact Creation**: `crm/v3/objects/contacts/create`
- **Event Tracking**: `events/v3/send`
- **Email Campaign Creation**: `marketing/v3/emails`

The system is now configured to try the v1 API endpoints first, and if they fail, it will fall back to the v3 endpoints. This provides better compatibility across different HubSpot accounts and API access levels.

If you're experiencing issues with a specific endpoint, you can check the HubSpot API documentation for more information:

- [HubSpot API Documentation](https://developers.hubspot.com/docs/api/overview)

## Debugging Tips

1. **Check the Server Logs**: Look for error messages in the server logs that might provide more information about the issue.

2. **Enable Verbose Logging**: You can enable more detailed logging by setting the `DEBUG` environment variable:

   ```bash
   DEBUG=hubspot:* npm run dev
   ```

3. **Use the Browser Developer Tools**: Check the Network tab in the browser developer tools to see the API requests and responses.

4. **Test with Postman**: You can use Postman to test the HubSpot API endpoints directly, which can help isolate issues.

## Contact Support

If you're still experiencing issues with the HubSpot integration, please contact the development team for assistance.
