import { createClient } from '@sanity/client';

// Use the Project ID and Dataset found in your sanity.config.ts file
const projectId = 'g7f0f6rs';
const dataset = 'production';
const apiVersion = '2023-05-03';

// Create a client specifically for authentication
export const authClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // We need to use the API directly for authentication
  withCredentials: true, // Important for auth
  token: process.env.SANITY_API_TOKEN, // Optional: for server-side operations
});

// Function to check if a user is authenticated with Sanity
export async function checkSanityAuth(token: string): Promise<boolean> {
  try {
    // Create a client with the provided token
    const client = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      token,
    });

    // Try to fetch the current user
    // If this succeeds, the token is valid
    const user = await client.request({ url: '/users/me' });
    return !!user;
  } catch (error) {
    console.error('Error checking Sanity auth:', error);
    return false;
  }
}
